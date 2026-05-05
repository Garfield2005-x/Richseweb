export async function sendLineMessage(message: string, to?: string) {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const target = to || process.env.LINE_STAFF_GROUP_ID || "C87ada7e86d05906061a3f0402c11ac11"; // Default to Staff Group
    console.log("Sending LINE message to:", target);

    if (!token) {
      console.warn("LINE_CHANNEL_ACCESS_TOKEN is not defined");
      return { success: false, error: "Token missing" };
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        to: target,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("LINE API ERROR:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("LINE API EXCEPTION:", error);
    return { success: false, error };
  }
}
