
import { MissionBriefing } from "../types";

// Mock implementation to replace GoogleGenAI dependence
export const generateMissionBriefing = async (levelName: string, codename: string): Promise<MissionBriefing> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        objective: "Infiltre-se na instalação e recupere o pacote confidencial.",
        intel: "Varreduras de satélite mostram forte presença de guardas nos corredores.",
        dangerLevel: "EXTREMO",
    };
};

export const generateRadioMessage = async (context: string): Promise<string> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return "Mantenha os olhos abertos, agente.";
};
