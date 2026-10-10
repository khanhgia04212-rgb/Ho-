export type ReactionCategory = 
  | 'neutralization'
  | 'precipitation'
  | 'gas'
  | 'metal_displacement'
  | 'redox';

export interface Reactant {
  name: string;
  formula: string;
  subscript?: string;
  state: 'aq' | 's' | 'l' | 'g';
  liquidColor: string; // Hex color for liquid representation
  liquidOpacity: number;
  containerType: 'test_tube' | 'metal_strip' | 'solid_powder' | 'pipette';
  metalType?: 'Fe' | 'Zn' | 'Cu' | 'Al';
  concentration?: string;
}

export interface ReactionDetail {
  id: string;
  category: ReactionCategory;
  name: string;
  gradeLevel: string; // e.g. "Lớp 8, 9, 11"
  summaryObservation: string;
  
  reactant1: Reactant; // Tube A (recipient)
  reactant2: Reactant; // Tube B (poured into Tube A) or metal immersed
  
  result: {
    finalLiquidColor: string;
    finalLiquidOpacity: number;
    hasPrecipitate: boolean;
    precipitateColor?: string;
    precipitateName?: string;
    precipitateFormula?: string;
    precipitateType?: 'heavy' | 'gelatinous' | 'fine' | 'crystalline';
    
    hasGas: boolean;
    gasName?: string;
    gasFormula?: string;
    gasColor?: string;
    gasRate?: 'vigorous' | 'medium' | 'gentle';
    gasSmellNote?: string;
    splintTestResult?: 'extinguishes' | 'pop_sound' | 'ignites' | 'none';
    
    hasMetalPlating: boolean;
    metalPlatingColor?: string;
    metalPlatingName?: string;
    metalDissolves?: boolean;
    
    temperatureChange?: 'none' | 'exothermic_mild' | 'exothermic_hot';
    indicatorChange?: string;
  };

  equations: {
    molecular: string;
    molecularHtml: string;
    completeIonic?: string;
    netIonic: string;
    netIonicHtml: string;
    reactionType: string;
    keyMechanism: string;
  };

  didacticGuide: {
    teacherIntro: string;
    keyQuestions: string[];
    conceptTakeaway: string;
  };

  microscopicView: {
    title: string;
    description: string;
    ionsInvolved: string[];
    mechanismSummary: string;
  };
}
