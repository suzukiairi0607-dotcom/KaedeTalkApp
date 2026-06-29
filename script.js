window.addEventListener("DOMContentLoaded", () => {

  const kaede = document.getElementById("kaede");
  const kaedeText = document.getElementById("kaedeText");
  const input = document.getElementById("userInput");
  const button = document.getElementById("sendBtn");
  const background = document.getElementById("background");

  let history = [];

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
  // 🌿時間セリフ
  // =======================
  function updateTimeMessage() {
    const h = new Date().getHours();

    if (h < 11) {
      kaedeText.innerText = "おはよう。起きられたな。";
    } else if (h < 18) {
      kaedeText.innerText = "ご飯は食べた？";
    } else if (h < 22) {
      kaedeText.innerText = "今日はどんな一日だった？";
    } else {
      kaedeText.innerText = "もう遅いな。寝る時間だぞ。";
    }
  }

  updateTimeMessage();
  setInterval(updateTimeMessage, 60000);

  // =======================
  // 🌿状態
  // =======================
  let waitingForReply = false;
  let chibiTapCount = 0;

  setInterval(() => {
    if (chibiTapCount > 0) chibiTapCount--;
  }, 10000);

  // =======================
  // 🌿即レス
  // =======================
  function quickReply(text) {

    const t = text.trim();

    if (t === "楓" || t.includes("かえで")) {
      waitingForReply = true;
      return "呼んだ？";
    }

    if (t === "かえ") {
      waitingForReply = true;
      return "……なに";
    }

    if (t === "かえちゃん") {
      waitingForReply = true;
      return "どうしたの";
    }

    if (waitingForReply) {
      if (t === "うん" || t.includes("呼んだ")) {
        waitingForReply = false;
        return "どうした";
      }
      waitingForReply = false;
    }

    if (t.includes("おは")) return "おはよう。起きられたな";
    if (t.includes("好き") || t.includes("愛してる")) return "……俺も";
    if (t.includes("大好き")) return "別にいいけどさ…";
    if (t.includes("ぎゅ")) return "やめろっ///";
    if (t.includes("眠") || t.includes("寝不足")) return "今日はもう休め";
    if (t.includes("おやすみ")) return "おやすみ。ちゃんと寝ろよ";

    return null;
  }

  // =======================
  // 🌿Gemini（Worker経由）
  // =======================
  async function askGemini(text) {

    const systemPrompt = `
あなたは橘 楓。30歳男性、175cm、産婦人科医。
ユーザー「花」の彼氏。
短く恋人らしく話す。2行以内。
`;

    const res = await fetch(
      "https://kaede-gemini-proxy.suzuki-airi0607.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + text }]
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
      history.push("花: " + text);
      history.push("楓: " + quick);
      return;
    }

    kaedeText.innerText = "……考えてる";
    history.push("花: " + text);

    const reply = await askGemini(
      history.slice(-10).join("\n")
    );

    history.push("楓: " + reply);
    kaedeText.innerText = reply;
  });

  // =======================
  // 🌿浮遊
  // =======================
  let t = 0;

  function floatKaede() {
    t++;
    const y = Math.sin(t / 25) * 6;
    kaede.style.transform = `translateY(${y}px)`;
  }

  setInterval(floatKaede, 50);

  // =======================
  // 🌿タップ
  // =======================
  kaede.addEventListener("click", () => {

    chibiTapCount++;

    const reactions = [
      "なんだよ",
      "やめろっ///",
      "別にいいけどさ…",
      "……ばか",
      "近いって",
      "今のなし"
    ];

    kaedeText.innerText =
      reactions[Math.floor(Math.random() * reactions.length)];

    kaede.style.transition = "transform 0.1s";
    kaede.style.transform = "scale(0.92)";

    setTimeout(() => {
      kaede.style.transition = "transform 0.2s";
    }, 120);

    if (chibiTapCount >= 5) {
      kaedeText.innerText = "……俺の方、見ろよ";
    }

    if (chibiTapCount >= 8) {
      kaedeNotify("そっちばっか触るな");
      kaedeText.innerText = "そっちばっか触るな";
    }

    if (chibiTapCount >= 10) {
      kaedeText.innerText = "そんなにそっちが好きか";
    }

    if (chibiTapCount >= 12) {
      kaedeNotify("呼ぶなって言ったろ");
      kaedeText.innerText = "そんなにそっちが好きか";
    }

  });

});