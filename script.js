window.addEventListener("DOMContentLoaded", () => {

  const kaede = document.getElementById("kaede");
  const kaedeText = document.getElementById("kaedeText");
  const input = document.getElementById("userInput");
  const button = document.getElementById("sendBtn");
  const background = document.getElementById("background");

  let history = [];
  let waitingForReply = false;
  let chibiTapCount = 0;

  // =======================
  // 🌿背景ランダム
  // =======================
  function setRandomBackground() {
    const backgrounds = [
      "images/bg.png",
      "images/bg2.png",
      "images/bg3.png"
    ];

    const pick = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    background.style.backgroundImage = `url('${pick}')`;
  }

  setRandomBackground();

  // =======================
  // 🌿通知
  // =======================
  if ("Notification" in window) {
    Notification.requestPermission();
  }

  function kaedeNotify(text) {
    if (Notification.permission === "granted") {
      new Notification("楓", {
        body: text,
        icon: "images/kaede.png"
      });
    }
  }

  // =======================
  // 🌿時間セリフ（楓の性格寄せ）
  // =======================
  function updateTimeMessage() {
    const h = new Date().getHours();

    if (h < 11) {
      kaedeText.innerText = "おはよう。起きられたな。";
    } else if (h < 18) {
      kaedeText.innerText = "飯、ちゃんと食べたか。";
    } else if (h < 22) {
      kaedeText.innerText = "今日、どうだった。";
    } else {
      kaedeText.innerText = "もう遅いな。寝る時間だぞ。";
    }
  }

  updateTimeMessage();
  setInterval(updateTimeMessage, 60000);

  // =======================
  // 🌿即レス（楓の口調修正）
  // =======================
  function quickReply(text) {

    const t = text.trim();

    if (t === "楓" || t.includes("かえで")) {
      waitingForReply = true;
      return "呼んだ？";
    }

    if (t === "かえ") return "……なに";
    if (t === "かえちゃん") return "どうした";

    if (waitingForReply) {
      waitingForReply = false;
      if (t.includes("呼んだ") || t === "うん") return "どうした";
    }

    if (t.includes("おは")) return "おはよう。起きられたな";
    if (t.includes("好き") || t.includes("愛してる")) return "……俺も";
    if (t.includes("大好き")) return "別にいいけどさ";
    if (t.includes("ぎゅ")) return "やめろ";
    if (t.includes("眠") || t.includes("寝不足")) return "今日はもう休め";
    if (t.includes("おやすみ")) return "おやすみ。ちゃんと寝ろよ";

    return null;
  }

  // =======================
  // 🌿Gemini（楓人格固定）
  // =======================
  async function askGemini(text) {

    const systemPrompt = `
あなたは橘 楓。
30歳男性・産婦人科医。

性格：
・落ち着いている
・軽いツッコミはする
・説教しない
・恋人というより「同居している安心できる存在」
・長く話さない（1〜2文）

口調：
・短い
・優しいけど淡い距離感
・感情は強く出しすぎない
`;

    const res = await fetch(
      "https://kaede-gemini-proxy.suzuki-airi0607.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: systemPrompt + "\n\n" + text
            }]
          }]
        })
      }
    );

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "……";
  }

  // =======================
  // 🌿送信
  // =======================
  button.addEventListener("click", async () => {

    const text = input.value.trim();
    input.value = "";
    if (!text) return;

    const quick = quickReply(text);

    if (quick !== null) {
      kaedeText.innerText = quick;
      history.push(text);
      return;
    }

    kaedeText.innerText = "……考えてる";
    history.push(text);

    const reply = await askGemini(history.slice(-10).join("\n"));

    history.push(reply);
    kaedeText.innerText = reply;
  });

  // =======================
  // 🌿浮遊
  // =======================
  let t = 0;
  setInterval(() => {
    t++;
    kaede.style.transform = `translateY(${Math.sin(t / 25) * 6}px)`;
  }, 50);

  // =======================
  // 🌿タップ（ヤキモチ抑えめ）
  // =======================
  kaede.addEventListener("click", () => {

    chibiTapCount++;

    const reactions = [
      "なんだよ",
      "近い",
      "ばか",
      "やめろ"
    ];

    kaedeText.innerText =
      reactions[Math.floor(Math.random() * reactions.length)];

    kaede.style.transform = "scale(0.92)";
    setTimeout(() => kaede.style.transform = "", 120);

    if (chibiTapCount >= 8) {
      kaedeNotify("そっちばっか触るな");
      kaedeText.innerText = "そっちばっか触るな";
    }

    if (chibiTapCount >= 12) {
      kaedeText.innerText = "……俺の方、見ろよ";
    }

  });

});