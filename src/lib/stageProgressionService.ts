// Stage-based progression for B2B Sales Training
// User must PASS each stage before proceeding to the next

export type TrainingStage = 
  | 'company-selection'
  | 'persona-selection' 
  | 'script-reading'    // Interactive script study
  | 'practice-call'     // AI role-play
  | 'live-call'        // Real call recording
  | 'review';          // Post-call review

export interface StageRequirement {
  id: TrainingStage;
  name: string;
  description: string;
  icon: string; // Phosphor icon name
  requiredPassCount: number; // How many successful calls needed to pass
  dependsOn: TrainingStage[]; // Prerequisite stages
  isLocked: boolean;
  isPassed: boolean;
  attempts: number;
  passedCount: number;
}

export interface StageProgression {
  currentStage: TrainingStage;
  stages: Record<TrainingStage, StageRequirement>;
  overalProgress: number; // 0-100
}

// Default stage configuration
export const DEFAULT_STAGES: Record<TrainingStage, Omit<StageRequirement, 'isLocked' | 'isPassed' | 'attempts' | 'passedCount'>> = {
  'company-selection': {
    id: 'company-selection',
    name: 'Select Company',
    description: 'Choose your training company (EIGER MARVEL HR or SGC TECH AI)',
    icon: 'Building',
    requiredPassCount: 1,
    dependsOn: [],
  },
  'persona-selection': {
    id: 'persona-selection',
    name: 'Choose Persona',
    description: 'Select a B2B decision-maker persona to practice with',
    icon: 'User',
    requiredPassCount: 1,
    dependsOn: ['company-selection'],
  },
  'script-reading': {
    id: 'script-reading',
    name: 'Read Script',
    description: 'Study the interactive sales script for your selected persona',
    icon: 'Books',
    requiredPassCount: 1,
    dependsOn: ['persona-selection'],
  },
  'practice-call': {
    id: 'practice-call',
    name: 'AI Practice',
    description: 'Complete practice calls with AI voice agent (pass 3 calls)',
    icon: 'Robot',
    requiredPassCount: 3,
    dependsOn: ['script-reading'],
  },
  'live-call': {
    id: 'live-call',
    name: 'Live Call',
    description: 'Record and analyze a real sales call with your voice agent',
    icon: 'PhoneCall',
    requiredPassCount: 1,
    dependsOn: ['practice-call'],
  },
  'review': {
    id: 'review',
    name: 'Review & Certify',
    description: 'Final review and certification of training completion',
    icon: 'Certificate',
    requiredPassCount: 1,
    dependsOn: ['live-call'],
  },
};

// Stage progression service
export class StageProgressionService {
  private storageKey = 'scholarix-stage-progression';
  
  // Load progression from localStorage
  loadProgression(): StageProgression {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load stage progression:', e);
    }
    
    // Return default (fresh start)
    return this.createDefaultProgression();
  }
  
  // Save progression to localStorage
  saveProgression(progression: StageProgression): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progression));
    } catch (e) {
      console.warn('Failed to save stage progression:', e);
    }
  }
  
  // Create default progression
  private createDefaultProgression(): StageProgression {
    const stages: Record<TrainingStage, StageRequirement> = {} as any;
    
    (Object.keys(DEFAULT_STAGES) as TrainingStage[]).forEach(stageId => {
      const config = DEFAULT_STAGES[stageId];
      stages[stageId] = {
        ...config,
        isLocked: config.dependsOn.length > 0, // Locked if has dependencies
        isPassed: false,
        attempts: 0,
        passedCount: 0,
      };
    });
    
    // Unlock first stage
    stages['company-selection'].isLocked = false;
    
    return {
      currentStage: 'company-selection',
      stages,
      overalProgress: 0,
    };
  }
  
  // Check if a stage is unlocked (all dependencies passed)
  isStageUnlocked(stageId: TrainingStage, progression: StageProgression): boolean {
    const stage = progression.stages[stageId];
    if (!stage) return false;
    
    // Check all dependencies are passed
    return stage.dependsOn.every(depId => 
      progression.stages[depId]?.isPassed
    );
  }
  
  // Record an attempt at a stage
  recordAttempt(
    stageId: TrainingStage, 
    passed: boolean, 
    progression: StageProgression
  ): StageProgression {
    const stage = progression.stages[stageId];
    if (!stage) return progression;
    
    stage.attempts += 1;
    if (passed) {
      stage.passedCount += 1;
    }
    
    // Check if stage is now passed
    if (stage.passedCount >= stage.requiredPassCount) {
      stage.isPassed = true;
      
      // Unlock next stage
      this.unlockNextStage(stageId, progression);
    }
    
    // Update current stage if this one is passed
    if (stage.isPassed && stageId === progression.currentStage) {
      progression.currentStage = this.getNextStage(stageId, progression);
    }
    
    this.updateProgress(progression);
    this.saveProgression(progression);
    return progression;
  }
  
  // Unlock the next stage after passing current
  private unlockNextStage(currentStage: TrainingStage, progression: StageProgression): void {
    const stageOrder: TrainingStage[] = [
      'company-selection',
      'persona-selection',
      'script-reading',
      'practice-call',
      'live-call',
      'review'
    ];
    
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      progression.stages[nextStage].isLocked = false;
    }
  }
  
  // Get the next stage
  private getNextStage(currentStage: TrainingStage, progression: StageProgression): TrainingStage {
    const stageOrder: TrainingStage[] = [
      'company-selection',
      'persona-selection',
      'script-reading',
      'practice-call',
      'live-call',
      'review'
    ];
    
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      return stageOrder[currentIndex + 1];
    }
    return currentStage; // Already at last stage
  }
  
  // Update overall progress percentage
  private updateProgress(progression: StageProgression): void {
    const totalStages = Object.keys(progression.stages).length;
    const passedStages = Object.values(progression.stages).filter(s => s.isPassed).length;
    progression.overalProgress = Math.round((passedStages / totalStages) * 100);
  }
  
  // Reset all progress
  resetProgression(): StageProgression {
    localStorage.removeItem(this.storageKey);
    return this.createDefaultProgression();
  }
}

// Export singleton
export const stageProgressionService = new StageProgressionService();
