import Match from '../model/matchModel.js';
import Problem from '../model/problemModel.js';
import Submission from '../model/submissionModel.js';
import MatchParticipant from '../model/matchParticipantModel.js';
import { evaluateSubmission } from '../services/executionService.js';

// Helper function to emit progress update
const emitProgressUpdate = (io, matchId, userId, problemId, status, message) => {
    io.to(matchId).emit('problemProgress', {
        userId,
        problemId,
        status,
        message,
        timestamp: new Date()
    });
};

// Helper function to validate match status
const validateMatch = async (matchId) => {
    const match = await Match.findById(matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    if (match.status !== 'in-progress') {
        throw new Error('Match is not active or has ended');
    }
    return match;
};

// Helper function to check if match should end
const checkMatchEnd = async (matchId) => {
    const match = await Match.findById(matchId)
        .populate('problems')
        .populate('participants');

    const totalProblems = match.problems.length;

    // Check if all participants have solved all problems
    const allComplete = match.participants.every(participant => {
        const solvedCount = participant.problems.filter(p => p.status === 'solved').length;
        return solvedCount === totalProblems;
    });

    if (allComplete) {
        await determineWinner(matchId);
    }
};

// Helper function to determine match winner
const determineWinner = async (matchId) => {
    const participants = await MatchParticipant.find({ matchId })
        .sort({ score: -1, totalTime: 1 }); // Sort by highest score and lowest time

    const winner = participants[0];

    // Update match status
    await Match.findByIdAndUpdate(matchId, {
        status: 'completed',
        endedAt: new Date(),
        winnerId: winner.userId
    });

    return winner.userId;
};

// Main submission handler
export const handleSubmission = async (req, res) => {
    try {
        const { matchId, problemId, code, language } = req.body;
        const userId = req.user.id;
        const io = req.app.get('io');

        // 1. Validate match
        const match = await validateMatch(matchId);

        // 2. Get problem details
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // 3. Get participant record
        let participant = await MatchParticipant.findOne({ userId, matchId });
        if (!participant) {
            return res.status(404).json({ message: 'Participant not found in match' });
        }

        // 4. Evaluate code
        const result = await evaluateSubmission(
            code,
            language,
            problem
        );

        // 5. Create submission record
        const submission = await Submission.create({
            userId,
            matchId,
            problemId,
            code,
            language,
            status: result.status,
            testCasesPassed: result.testCasesPassed || 0,
            totalTestCases: result.totalTestCases,
            error: result.error || null,
            testResults: result.testResults || []
        });

        // 6. Update problem progress
        let problemProgress = participant.problems.find(p => p.problemId.toString() === problemId);
        if (!problemProgress) {
            participant.problems.push({
                problemId,
                status: 'not_attempted',
                attempts: 0,
                bestScore: 0
            });
            problemProgress = participant.problems[participant.problems.length - 1];
        }

        problemProgress.attempts += 1;
        problemProgress.lastSubmissionTime = new Date();

        // 7. Update status based on result
        const previousStatus = problemProgress.status;
        if (result.status === 'Accepted') {
            problemProgress.status = 'solved';
            if (problemProgress.bestScore === 0) {
                problemProgress.bestScore = 1;
                participant.totalScore += 1;
            }
            // Emit success notification and progress update
            io.to(matchId).emit('submissionResult', {
                userId,
                problemId,
                status: 'solved',
                previousStatus,
                message: 'solved the problem! 🎉',
                progress: {
                    solved: participant.problems.filter(p => p.status === 'solved').length,
                    attempted: participant.problems.filter(p => p.status === 'attempted').length,
                    total: match.problems.length
                }
            });
        } else {
            problemProgress.status = 'attempted';
            // Emit attempt notification and progress update
            io.to(matchId).emit('submissionResult', {
                userId,
                problemId,
                status: 'attempted',
                previousStatus,
                message: 'attempted the problem',
                progress: {
                    solved: participant.problems.filter(p => p.status === 'solved').length,
                    attempted: participant.problems.filter(p => p.status === 'attempted').length,
                    total: match.problems.length
                }
            });
        }

        await participant.save();

        // 8. Get updated progress for both participants
        const participants = await MatchParticipant.find({ matchId })
            .populate('problems.problemId')
            .lean();

        // 9. Emit progress update
        const progressData = participants.map(p => ({
            userId: p.userId,
            problems: p.problems.map(prob => ({
                problemId: prob.problemId._id,
                status: prob.status,
                attempts: prob.attempts
            })),
            totalScore: p.totalScore
        }));

        io.to(matchId).emit('battleProgress', {
            matchId,
            progress: progressData
        });

        // 10. Check if match should end
        await checkMatchEnd(matchId);

        // 11. Send response
        res.json({
            success: true,
            submission: {
                id: submission._id,
                status: result.status,
                testCasesPassed: result.testCasesPassed,
                totalTestCases: result.totalTestCases,
                error: result.error,
                testResults: result.testResults
            },
            progress: {
                status: problemProgress.status,
                attempts: problemProgress.attempts,
                score: participant.totalScore
            }
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get submission history for a match
export const getMatchSubmissions = async (req, res) => {
    try {
        const { matchId } = req.params;
        const submissions = await Submission.find({ matchId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username')
            .populate('problemId', 'title');
        res.json(submissions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get submission statistics for a user in a match
export const getUserMatchStats = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user._id;

        const stats = await MatchParticipant.findOne({ matchId, userId })
            .populate('solvedProblems', 'title');

        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get full report for a match (used for Match Analysis modal)
export const getMatchReport = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user._id;

        // Use MatchParticipant-based data (more reliable than Match.host/challenger)
        const match = await Match.findById(matchId).populate('problems');
        if (!match) return res.status(404).json({ error: "Match not found" });

        const participants = await MatchParticipant.find({ matchId }).populate('userId', 'name username photoURL');
        const myParticipant = participants.find(p => p.userId._id.toString() === userId.toString());
        const opponentParticipant = participants.find(p => p.userId._id.toString() !== userId.toString());

        if (!myParticipant) return res.status(404).json({ error: "User not part of this match" });

        const submissions = await Submission.find({ matchId, userId }).sort({ createdAt: 1 }).populate('problemId');

        // Determine result using totalScore, fallback to match.winner
        let result = "Draw";
        if (opponentParticipant) {
            const myScore = myParticipant.totalScore || 0;
            const oppScore = opponentParticipant.totalScore || 0;
            const myTime = myParticipant.totalTime || 0;
            const oppTime = opponentParticipant.totalTime || 0;
            if (myScore > oppScore) result = "Win";
            else if (myScore < oppScore) result = "Loss";
            else if (myTime < oppTime) result = "Win";
            else if (myTime > oppTime) result = "Loss";
        } else if (match.winner) {
            result = match.winner.toString() === userId.toString() ? "Win" : "Loss";
        } else {
             result = "Win"; // solo match
        }

        const matchStart = match.createdAt.getTime();
        const matchEnd = match.endedAt ? match.endedAt.getTime() : Date.now();
        const durationMs = matchEnd - matchStart;
        const durationMins = Math.floor(durationMs / 60000);
        const durationSecs = Math.floor((durationMs % 60000) / 1000);
        const durationStr = `${durationMins}:${durationSecs < 10 ? '0' : ''}${durationSecs}`;

        // Build cognitive flow data
        const cognitiveFlowData = [{ time: 0, flow: 0, label: "Match Started" }];
        let currentFlow = 0;

        submissions.forEach(sub => {
            const timeSinceStartMs = sub.createdAt.getTime() - matchStart;
            const timeMins = Math.floor(timeSinceStartMs / 60000);
            
            if (sub.status === 'Accepted') {
                currentFlow = 100;
                cognitiveFlowData.push({ time: timeMins, flow: currentFlow, label: `Solved: ${sub.problemId.title.substring(0, 10)}...` });
            } else {
                currentFlow -= 20;
                if (currentFlow < -100) currentFlow = -100;
                cognitiveFlowData.push({ time: timeMins, flow: currentFlow, label: `Failed Attempt` });
            }
        });

        // Add end of match flow
        cognitiveFlowData.push({ time: durationMins, flow: currentFlow, label: "Match End" });

        // Build problems stats
        const problemsStats = match.problems.map(prob => {
            const participantProb = myParticipant.problems.find(p => p.problemId.toString() === prob._id.toString());
            const probSubmissions = submissions.filter(s => s.problemId._id.toString() === prob._id.toString());
            
            const solvedSub = probSubmissions.find(s => s.status === 'Accepted');
            let timeSpentStr = "00:00";
            if (solvedSub) {
                const ms = solvedSub.createdAt.getTime() - matchStart;
                const m = Math.floor(ms / 60000);
                const s = Math.floor((ms % 60000) / 1000);
                timeSpentStr = `${m}:${s < 10 ? '0' : ''}${s}`;
            } else if (probSubmissions.length > 0) {
                 // time from first sub to last sub if not solved
                 const ms = probSubmissions[probSubmissions.length-1].createdAt.getTime() - probSubmissions[0].createdAt.getTime();
                 const m = Math.floor(ms / 60000);
                 const s = Math.floor((ms % 60000) / 1000);
                 timeSpentStr = `${m}:${s < 10 ? '0' : ''}${s}`;
            }

            const failedAttempts = probSubmissions.filter(s => s.status !== 'Accepted').length;

            return {
                name: prob.title,
                points: `${prob.difficulty === 'Easy' ? 50 : prob.difficulty === 'Medium' ? 100 : 150} Pts`,
                stats: [
                    { label: "Total Time Spent", value: timeSpentStr },
                    { label: "Submissions", value: probSubmissions.length.toString() },
                    { label: "Failed Attempts", value: failedAttempts.toString(), status: failedAttempts > 0 ? "fail" : "" },
                    { label: "Final Result", value: participantProb?.status === 'solved' ? "Passed" : (probSubmissions.length > 0 ? "Failed" : "Skipped"), status: participantProb?.status === 'solved' ? "pass" : "fail" }
                ]
            };
        });

        // Generate Dynamic Takeaways
        const takeaways = [];
        const solvedCount = myParticipant.problems.filter(p => p.status === 'solved').length;
        
        if (solvedCount === match.problems.length) {
            takeaways.push({ color: "text-green-400", title: "Flawless Victory", description: "You successfully solved all problems in the match!" });
        } else if (solvedCount === 0) {
            takeaways.push({ color: "text-red-400", title: "Tough Match", description: "You didn't solve any problems this time. Review the solutions and keep practicing." });
        }

        const maxFails = Math.max(...problemsStats.map(p => parseInt(p.stats[2].value)));
        if (maxFails >= 3) {
            takeaways.push({ color: "text-yellow-400", title: "Persistence", description: `You had multiple failed attempts on a problem. Make sure to read the test cases carefully.` });
        }

        if (takeaways.length === 0) {
             takeaways.push({ color: "text-blue-400", title: "Solid Effort", description: "You made good progress during the match." });
        }

        const report = {
            matchId: match._id,
            opponent: opponentParticipant?.userId?.name || opponentParticipant?.userId?.username || "Opponent",
            result,
            score: `${myParticipant.totalScore} pts`,
            duration: durationStr,
            takeaways,
            cognitiveFlowData,
            problems: problemsStats
        };

        res.json(report);
    } catch (error) {
        console.error("Match report error:", error);
        res.status(500).json({ error: error.message });
    }
};