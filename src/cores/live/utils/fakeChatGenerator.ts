/**
 * VAN-BOTZ INHERITED FAKE CHAT GENERATOR (DUMMY SYSTEM EXCLUSIVE)
 * Models detailed WhatsApp message structures for high-fidelity chat simulations
 * in an isolated sandbox, ensuring zero cross-contamination with production fields.
 */

export interface SimulatedWhatsAppMessage {
  id: string;
  senderName: string;
  senderNumber: string;
  avatarUrl: string;
  messageText: string;
  timestamp: string;
  isMe: boolean;
  isSystem: boolean;
  status: "sent" | "delivered" | "read";
  attachment?: {
    fileName: string;
    fileSize: string;
    fileType: "las" | "segy" | "csv" | "ohm" | "png";
  };
}

export const FAKE_CHAT_CONSTANTS = {
  SENDER_ROLES: {
    OPERATOR: { name: "Coordinator (Owner)", number: "+62-852-XXXX-XXXX", avatar: "CC" },
    VANCE: { name: "Dr. Marcus Vance (Geophysics)", number: "Swarm Cluster 1", avatar: "GV" },
    ROSTOVA: { name: "Dr. Elena Rostova (Structural)", number: "Swarm Cluster 2", avatar: "GR" },
    LIN: { name: "Dr. Sarah Lin (Petrophysics)", number: "Swarm Cluster 3", avatar: "PT" },
    SYSTEM: { name: "GeoAI Pro Orchestrator", number: "Security Daemon", avatar: "SYS" }
  } as const,
  INITIAL_SIMULATED_CHATS: [
    {
      id: "init_1",
      senderName: "Coordinator (Owner)",
      senderNumber: "+62-852-XXXX-XXXX",
      avatarUrl: "CC",
      messageText: "Verify current seismic horizon models near Drill Site B-02. Send over files.",
      timestamp: "10:14 AM",
      isMe: true,
      isSystem: false,
      status: "read"
    },
    {
      id: "init_2",
      senderName: "Dr. Marcus Vance (Geophysics)",
      senderNumber: "Swarm Cluster 1",
      avatarUrl: "GV",
      messageText: "Roger that, Owner. Analyzing seismic reflectivity wavelet coordinates. Ingesting Field_Data_Reservoir_Reflectivity.csv now.",
      timestamp: "10:15 AM",
      isMe: false,
      isSystem: false,
      status: "read",
      attachment: {
        fileName: "Field_Data_Reservoir_Reflectivity.csv",
        fileSize: "1.4 MB",
        fileType: "csv"
      }
    },
    {
      id: "init_3",
      senderName: "GeoAI Pro Orchestrator",
      senderNumber: "Security Daemon",
      avatarUrl: "SYS",
      messageText: "SYSTEM MESSAGE: Telemetry analysis successful. Drill site B-02 confirmed anomalies mapped at depth 2400m.",
      timestamp: "10:16 AM",
      isMe: false,
      isSystem: true,
      status: "read"
    }
  ] as SimulatedWhatsAppMessage[]
};

export class FakeChatGenerator {
  /**
   * Spawns a list of fake conversations for the dashboard simulation preview channels
   */
  public static generateSimulatedDialogue(userMessage: string, agentReplies: string[]): SimulatedWhatsAppMessage[] {
    const thread: SimulatedWhatsAppMessage[] = [];
    const baseTime = new Date();

    // 1. User original submission
    thread.push({
      id: "sim_usr_" + Math.random().toString(36).substring(7),
      senderName: FAKE_CHAT_CONSTANTS.SENDER_ROLES.OPERATOR.name,
      senderNumber: FAKE_CHAT_CONSTANTS.SENDER_ROLES.OPERATOR.number,
      avatarUrl: FAKE_CHAT_CONSTANTS.SENDER_ROLES.OPERATOR.avatar,
      messageText: userMessage,
      timestamp: baseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isSystem: false,
      status: "read"
    });

    // 2. Swarm replies sequential progression with offset times
    agentReplies.forEach((reply, idx) => {
      const agentKeys = Object.keys(FAKE_CHAT_CONSTANTS.SENDER_ROLES) as Array<keyof typeof FAKE_CHAT_CONSTANTS.SENDER_ROLES>;
      // Loop through Vance, Rostova, Lin based on index
      const activeKey = agentKeys[(idx % 3) + 1]; // Offset index 1 to 3
      const agentInfo = FAKE_CHAT_CONSTANTS.SENDER_ROLES[activeKey];

      const offsetTime = new Date(baseTime.getTime() + (idx + 1) * 30000);
      
      thread.push({
        id: `sim_agt_${idx}_` + Math.random().toString(36).substring(7),
        senderName: agentInfo.name,
        senderNumber: agentInfo.number,
        avatarUrl: agentInfo.avatar,
        messageText: reply,
        timestamp: offsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        isSystem: false,
        status: "read"
      });
    });

    return thread;
  }
}
