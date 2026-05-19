import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { analyzeVoice, getVoiceAnalysisHistory } from '../services/voiceAnalysisService';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await analyzeVoice(req.userId!, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Voice analysis failed' });
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const history = await getVoiceAnalysisHistory(req.userId!);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
