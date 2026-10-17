
    const iconHeart = '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>';
    const iconUser = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>';
    const iconSave = '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"></path></svg>';
    const iconShare = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.5 6.8-4"></path><path d="m8.6 13.5 6.8 4"></path></svg>';

    const localFileHref = (relativePath) => new URL(relativePath, window.location.href).href;

    const assets = {
      mia: "app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg",
      sofia: "app_prototype_assets/dealers/dealer_sofia_avatar_v1.jpg",
      marcus: "app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg",
      lilit: "app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg",
      streamFeed: "",
      streamOverlay: "",
      streamDealer: "",
      streamRealBlackjack: "",
      streamRealRoulette: "",
      streamRealBaccarat: ""
    };

    const cards = [
      {
        id: "mia",
        dealer: "Mia",
        title: "Mia Roulette Preview",
        game: "Roulette",
        table: "Roulette Mania",
        operator: "Illustrative operator",
        image: assets.mia,
        providerCapture: true,
        feedVideo: assets.streamRealRoulette,
        tableVideo: assets.streamRealRoulette,
        watchVideo: assets.streamRealRoulette,
        gameplayVideo: assets.streamRealRoulette,
        watching: "Session preview",
        join: "Follow",
        arpu: "Return",
        follows: "Creator",
        stakes: "Operator-defined",
        seat: "Demo",
        language: "EN",
        state: "8 red / 2 green",
        trend: "Table signal",
        caption: "Illustrative roulette room with a clear wheel view and handoff preview.",
        read: "Illustrative roulette room with a clear wheel view.",
        gameplayTimer: "12s to spin",
        rouletteTrack: ["32", "15", "0", "19", "4"],
        rouletteColors: ["red", "black", "green", "red", "black"]
      },
      {
        id: "sofia",
        dealer: "Sofia",
        title: "Blackjack VIP",
        game: "Blackjack",
        table: "Blackjack Royal",
        operator: "Illustrative operator",
        image: assets.sofia,
        providerCapture: true,
        feedVideo: assets.streamRealBlackjack,
        tableVideo: assets.streamRealBlackjack,
        watchVideo: assets.streamRealBlackjack,
        gameplayVideo: assets.streamRealBlackjack,
        watching: "Session preview",
        join: "Follow",
        arpu: "Return",
        follows: "Creator",
        stakes: "Operator-defined",
        seat: "Demo",
        language: "EN",
        state: "VIP open",
        trend: "Table signal",
        caption: "Illustrative Blackjack room with clean dealing and readable cards.",
        read: "Illustrative Blackjack room with readable cards.",
        gameplayTimer: "Action on you",
        dealerHand: ["A", "5"],
        playerHand: ["8", "7"]
      },
      {
        id: "marcus",
        dealer: "Marcus",
        title: "Baccarat Night",
        game: "Baccarat",
        table: "Golden Baccarat",
        operator: "Illustrative operator",
        image: assets.marcus,
        feedVideo: assets.streamFeed,
        tableVideo: assets.streamFeed,
        watchVideo: assets.streamFeed,
        gameplayVideo: assets.streamFeed,
        watching: "Session preview",
        join: "Follow",
        arpu: "Return",
        follows: "Creator",
        stakes: "Operator-defined",
        seat: "Demo",
        language: "EN",
        state: "Banker run",
        trend: "Table signal",
        caption: "Baccarat room with clear side choice, visible road flow and steady pace.",
        read: "Baccarat room with clean road view and quick side selection.",
        gameplayTimer: "9s to deal",
        baccaratRoad: ["banker", "player", "banker", "banker", "tie", "player", "banker", "banker", "player", "player", "banker", "tie"]
      },
      {
        id: "lilit",
        dealer: "Lilit",
        title: "Poker After Dark",
        game: "Poker",
        table: "Hold'em Lounge",
        operator: "Illustrative operator",
        image: assets.lilit,
        feedVideo: assets.streamFeed,
        tableVideo: assets.streamDealer,
        watchVideo: assets.streamDealer,
        gameplayVideo: assets.streamDealer,
        watching: "Session preview",
        join: "Follow",
        arpu: "Return",
        follows: "Creator",
        stakes: "Operator-defined",
        seat: "Demo",
        language: "EN",
        state: "Heads-up",
        trend: "Table signal",
        caption: "Heads-up poker room with visible board cards and a cleaner live-table pace.",
        read: "Heads-up poker room with readable board cards and light table chat.",
        gameplayTimer: "8s to deal"
      }
    ];

    const gameBankrollBase = {
      Roulette: 1240,
      Blackjack: 1540,
      Baccarat: 2080,
      Poker: 1860
    };

    const rouletteOutsideConfig = {
      red: { label: "Red", payout: 1 },
      black: { label: "Black", payout: 1 },
      odd: { label: "Odd", payout: 1 },
      even: { label: "Even", payout: 1 },
      low: { label: "1-18", payout: 1 },
      high: { label: "19-36", payout: 1 },
      dozen1: { label: "1st 12", payout: 2 },
      dozen2: { label: "2nd 12", payout: 2 },
      dozen3: { label: "3rd 12", payout: 2 },
      col1: { label: "Col 1", payout: 2 },
      col2: { label: "Col 2", payout: 2 },
      col3: { label: "Col 3", payout: 2 }
    };

    const rouletteBoardLayout = {
      outsideRows: [
        [["low", "1-18"], ["even", "Even"], ["red", "Red"]],
        [["black", "Black"], ["odd", "Odd"], ["high", "19-36"]]
      ],
      dozens: [["dozen1", "1st 12"], ["dozen2", "2nd 12"], ["dozen3", "3rd 12"]],
      columns: [["col1", "Col 1"], ["col2", "Col 2"], ["col3", "Col 3"]]
    };

    const rouletteStreetKeys = [];
    const rouletteLineKeys = [];
    const rouletteCornerKeys = [];
    const rouletteSplitZeroKeys = [];
    const rouletteSplitHorizontalKeys = [];
    const rouletteSplitVerticalKeys = [];
    const rouletteWheelOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    const rouletteSectorCalls = [
      { label: "Voisins", meta: "17 nums", numbers: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25] },
      { label: "Tiers", meta: "12 nums", numbers: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33] },
      { label: "Orphelins", meta: "8 nums", numbers: [17, 34, 6, 1, 20, 14, 31, 9] }
    ];
    const rouletteNeighborCalls = [0, 17, 32, 8, 31, 26].map((center) => {
      const index = rouletteWheelOrder.indexOf(center);
      const neighbors = Array.from({ length: 5 }, (_, offset) => rouletteWheelOrder[(index + offset - 2 + rouletteWheelOrder.length) % rouletteWheelOrder.length]);
      return { label: `${center} ±2`, meta: "5 nums", numbers: neighbors };
    });

    const rouletteSpecialConfig = (() => {
      const config = {};
      const add = (group, key, label, numbers, payout, shortLabel = label) => {
        config[key] = { group, key, label, shortLabel, numbers, payout };
      };
      add("trio", "trio:0-1-2", "0-1-2 Trio", [0, 1, 2], 11, "0-1-2");
      add("trio", "trio:0-2-3", "0-2-3 Trio", [0, 2, 3], 11, "0-2-3");
      for (let start = 1; start <= 34; start += 3) {
        const numbers = [start, start + 1, start + 2];
        const key = `street:${numbers.join("-")}`;
        rouletteStreetKeys.push(key);
        add("street", key, `${start}-${start + 2} Street`, numbers, 11, `${start}-${start + 2}`);
      }
      for (let start = 1; start <= 31; start += 3) {
        const numbers = [start, start + 1, start + 2, start + 3, start + 4, start + 5];
        const key = `line:${start}-${start + 5}`;
        rouletteLineKeys.push(key);
        add("line", key, `${start}-${start + 5} Six Line`, numbers, 5, `${start}-${start + 5}`);
      }
      [["0-1", [0, 1]], ["0-2", [0, 2]], ["0-3", [0, 3]]].forEach(([label, numbers]) => {
        const key = `split:${label}`;
        rouletteSplitZeroKeys.push(key);
        add("split", key, `${label} Split`, numbers, 17, label);
      });
      for (let value = 1; value <= 36; value += 1) {
        if (value % 3 !== 0) {
          const key = `split:${value}-${value + 1}`;
          rouletteSplitHorizontalKeys.push(key);
          add("split", key, `${value}-${value + 1} Split`, [value, value + 1], 17, `${value}-${value + 1}`);
        }
        if (value <= 33) {
          const key = `split:${value}-${value + 3}`;
          rouletteSplitVerticalKeys.push(key);
          add("split", key, `${value}-${value + 3} Split`, [value, value + 3], 17, `${value}-${value + 3}`);
        }
        if (value <= 32 && value % 3 !== 0) {
          const numbers = [value, value + 1, value + 3, value + 4];
          const key = `corner:${numbers.join("-")}`;
          rouletteCornerKeys.push(key);
          add("corner", key, `${value}-${value + 4} Corner`, numbers, 8, `${value}-${value + 4}`);
        }
      }
      return config;
    })();

    const baccaratPayouts = {
      player: 1,
      banker: 0.95,
      tie: 8
    };

    const dealerFramePresets = {
      mia: {
        dealer: { mediaPosition: "center 11%", mediaScale: 1.02, videoPosition: "center 28%", videoScale: 1.18, videoFilter: "saturate(1.02) contrast(1.04) brightness(.88)", focusBottom: 232, focusHeight: 138, focusOpacity: .04, focusScale: .98 },
        table: { mediaPosition: "center 36%", mediaScale: 1.16, videoPosition: "center 44%", videoScale: 1.28, videoFilter: "saturate(1.02) contrast(1.05) brightness(.9)", focusBottom: 166, focusHeight: 132, focusOpacity: .06, focusScale: 1 },
        reveal: { mediaPosition: "center 31%", mediaScale: 1.14, videoPosition: "center 44%", videoScale: 1.34, videoFilter: "saturate(1.03) contrast(1.06) brightness(.93)", focusBottom: 182, focusHeight: 106, focusOpacity: .08, focusScale: 1.02 }
      },
      sofia: {
        dealer: { mediaPosition: "center 13%", mediaScale: 1.01, videoPosition: "center 36%", videoScale: 1.14, videoFilter: "saturate(1.02) contrast(1.04) brightness(.94)", focusBottom: 228, focusHeight: 136, focusOpacity: .04, focusScale: .97 },
        table: { mediaPosition: "center 41%", mediaScale: 1.18, videoPosition: "center 56%", videoScale: 1.1, videoFilter: "saturate(1.03) contrast(1.04) brightness(.98)", focusBottom: 168, focusHeight: 122, focusOpacity: .06, focusScale: 1 },
        reveal: { mediaPosition: "center 34%", mediaScale: 1.17, videoPosition: "center 58%", videoScale: 1.02, videoFilter: "saturate(1.04) contrast(1.05) brightness(1.02)", focusBottom: 184, focusHeight: 100, focusOpacity: .08, focusScale: 1.03 }
      },
      marcus: {
        dealer: { mediaPosition: "center 18%", mediaScale: 1, videoPosition: "center 42%", videoScale: .96, videoFilter: "saturate(1.02) contrast(1.03) brightness(.96)", focusBottom: 228, focusHeight: 136, focusOpacity: .04, focusScale: .98 },
        table: { mediaPosition: "center 44%", mediaScale: 1.06, videoPosition: "center 58%", videoScale: .86, videoFilter: "saturate(1.03) contrast(1.03) brightness(.99)", focusBottom: 170, focusHeight: 124, focusOpacity: .06, focusScale: 1 },
        reveal: { mediaPosition: "center 42%", mediaScale: 1.04, videoPosition: "center 60%", videoScale: .82, videoFilter: "saturate(1.04) contrast(1.04) brightness(1.01)", focusBottom: 186, focusHeight: 102, focusOpacity: .08, focusScale: 1.02 }
      },
      lilit: {
        dealer: { mediaPosition: "center 15%", mediaScale: 1.03, focusBottom: 246, focusHeight: 180, focusOpacity: .18, focusScale: .98 },
        table: { mediaPosition: "center 39%", mediaScale: 1.16, focusBottom: 166, focusHeight: 148, focusOpacity: .4, focusScale: 1 },
        reveal: { mediaPosition: "center 33%", mediaScale: 1.14, focusBottom: 186, focusHeight: 118, focusOpacity: .46, focusScale: 1.02 }
      }
    };

    const dealerCinematicPresets = {
      mia: {
        label: "European floor",
        note: "Mia holds the wheel long enough for the bet map to read before the drop."
      },
      sofia: {
        label: "VIP felt",
        note: "Sofia's deal pass stays low so the player sees the cards, not just the face cam."
      },
      marcus: {
        label: "Shoe rhythm",
        note: "Marcus plays the shoe through a reveal-first rhythm to keep Player/Banker legible."
      },
      lilit: {
        label: "After-hours poker",
        note: "Lilit holds the board low enough to read the community cards without drowning the dealer shot."
      }
    };

    const dealerRoomIntroPresets = {
      mia: {
        title: "Mia opens wide on the dealer, then gives the wheel a clean handoff once the map is locked.",
        note: "The first seconds sell a calm VIP roulette room before the spin takes over.",
        tags: ["Wheel-first entry", "VIP roulette", "Clean map read"]
      },
      sofia: {
        title: "Sofia starts face-up, then drops the frame lower so the player sees the actual deal path.",
        note: "The intro is built to prove cards stay readable without covering the dealer stream.",
        tags: ["Low felt entry", "Readable deal", "Seat-first"]
      },
      marcus: {
        title: "Marcus opens on the shoe, then transitions into the squeeze and road update without a heavy UI block.",
        note: "The first room moment is paced like a premium baccarat table, not a static mockup.",
        tags: ["Shoe-first", "Squeeze setup", "Road-ready"]
      },
      lilit: {
        title: "Lilit opens on the dealer, then drops to the board so the hand and showdown remain visible on mobile.",
        note: "The room intro stays short and the board becomes the main proof layer once the hand starts.",
        tags: ["Poker board", "Heads-up room", "Mobile-first"]
      }
    };

    const dealerFeedPresets = {
      mia: {
        floor: "European floor",
        hook: "Wheel-first discovery",
        glance: "Discovery card tuned for clean roulette read, VIP tone and a fast operator handoff.",
        feedPosition: "58.5% 34%",
        feedScale: 1.28,
        feedFilter: "saturate(1.02) contrast(1.04) brightness(.9)",
        profilePosition: "56% 28%",
        watchPosition: "58% 41%",
        watchScale: 1.34,
        watchFilter: "saturate(1.02) contrast(1.04) brightness(.92)",
        neutralGameplayStage: true,
        gameplayVideoPosition: "57% 42%",
        gameplayVideoScale: 1.3,
        gameplayVideoFilter: "saturate(1.03) contrast(1.05) brightness(.93)",
        overlay: {
          dealer: ["Dealer arc", "Open map", "VIP wheel"],
          table: ["Wheel lane", "Ball track", "Bet map"],
          reveal: ["Result pocket", "Payout lane", "Replay open"]
        }
      },
      sofia: {
        floor: "VIP felt",
        hook: "Readable deal path",
        glance: "Blackjack entry built around dealer presence, seat mood and a visible deal flow.",
        feedPosition: "56% 33%",
        feedScale: 1.26,
        feedFilter: "saturate(1.02) contrast(1.04) brightness(.9)",
        profilePosition: "55% 27%",
        watchPosition: "56% 39%",
        watchScale: 1.3,
        watchFilter: "saturate(1.02) contrast(1.04) brightness(.92)",
        gameplayVideoPosition: "55% 49%",
        gameplayVideoScale: 1.36,
        neutralGameplayStage: true,
        gameplayVideoFilter: "saturate(1.03) contrast(1.05) brightness(.93)",
        overlay: {
          dealer: ["Seat open", "Dealer box", "Decision ready"],
          table: ["Deal lane", "Player box", "Hit / Stand"],
          reveal: ["Hole card", "Settle lane", "Seat reset"]
        }
      },
      marcus: {
        floor: "Shoe rhythm",
        hook: "Squeeze-led baccarat",
        glance: "Baccarat card paced around side selection, shoe tension and road readability.",
        feedPosition: "55% 34%",
        feedScale: 1.24,
        feedFilter: "saturate(1.02) contrast(1.04) brightness(.9)",
        profilePosition: "54% 26%",
        watchPosition: "55% 37%",
        watchScale: 1.28,
        watchFilter: "saturate(1.02) contrast(1.04) brightness(.92)",
        gameplayVideoPosition: "54% 45%",
        gameplayVideoScale: 1.32,
        neutralGameplayStage: true,
        gameplayVideoFilter: "saturate(1.03) contrast(1.05) brightness(.93)",
        overlay: {
          dealer: ["Shoe open", "Side pick", "Calm table"],
          table: ["Player rail", "Tie center", "Banker rail"],
          reveal: ["Road print", "Squeeze close", "Next shoe"]
        }
      },
      lilit: {
        floor: "After-hours poker",
        hook: "Board-first hold'em",
        glance: "Poker card tuned around readable board cards, clear pot context and a lighter action layer.",
        feedPosition: "center 24%",
        profilePosition: "center 20%",
        watchPosition: "center 42%",
        watchScale: 1.08,
        watchFilter: "saturate(1.05) contrast(1.04) brightness(.94)",
        gameplayVideoPosition: "center 52%",
        gameplayVideoScale: .9,
        gameplayVideoFilter: "saturate(1.04) contrast(1.05) brightness(.95)",
        overlay: {
          dealer: ["Night room", "Button seat", "Dealer read"],
          table: ["Board lane", "Heads-up pot", "Action row"],
          reveal: ["Showdown board", "Pot ship", "Next hand open"]
        }
      }
    };

    const dealerMotionPresets = {
      mia: {
        idle: 7.9,
        breath: 5.6,
        driftX: 8,
        driftY: 10,
        sweep: 1.5,
        wheel: 2.92,
        deal: .46,
        reveal: .58,
        cardEnter: .36,
        score: 1.48,
        road: 1.38,
        spin: 2.34,
        settle: 1.12,
        cardStep: 70,
        revealDelay: 180,
        phaseMs: { Betting: 2520, Win: 2100, Loss: 1900 }
      },
      sofia: {
        idle: 6.8,
        breath: 4.8,
        driftX: 10,
        driftY: 8,
        sweep: 1.22,
        wheel: 2.56,
        deal: .38,
        reveal: .52,
        cardEnter: .3,
        score: 1.42,
        road: 1.3,
        spin: 2.1,
        settle: 1.02,
        cardStep: 54,
        revealDelay: 140,
        phaseMs: { Betting: 2360, Win: 2220, Loss: 1980 }
      },
      marcus: {
        idle: 8.3,
        breath: 5.9,
        driftX: 7,
        driftY: 11,
        sweep: 1.46,
        wheel: 2.72,
        deal: .5,
        reveal: .6,
        cardEnter: .34,
        score: 1.58,
        road: 1.44,
        spin: 2.24,
        settle: 1.1,
        cardStep: 82,
        revealDelay: 210,
        phaseMs: { Betting: 2620, Win: 2360, Loss: 2140 }
      },
      lilit: {
        idle: 7.1,
        breath: 5.0,
        driftX: 12,
        driftY: 9,
        sweep: 1.18,
        wheel: 2.24,
        deal: .42,
        reveal: .5,
        cardEnter: .3,
        score: 1.4,
        road: 1.28,
        spin: 1.96,
        settle: .96,
        cardStep: 62,
        revealDelay: 150,
        phaseMs: { Betting: 2480, Win: 2140, Loss: 1980 }
      }
    };

    const dealerRevealMicrostates = {
      mia: {
        win: ["Map locked", "12 / Red connects", "Payout push"],
        loss: ["Ball settles", "Map misses", "Next spin open"]
      },
      sofia: {
        win: ["Hole card flips", "Dealer busts", "Chips push"],
        loss: ["Hole card flips", "Dealer 20 holds", "Seat reset"]
      },
      marcus: {
        win: ["Squeeze reveal", "Player lands", "Road prints blue"],
        loss: ["Squeeze reveal", "Banker closes", "Road prints red"]
      },
      lilit: {
        win: ["Board lands", "Hero holds", "Pot ships"],
        loss: ["Board lands", "Villain takes it", "Next hand open"]
      }
    };

    const screen = document.getElementById("screen");
    const appTop = document.getElementById("appTop");
    const homeView = document.getElementById("homeView");
    const accountPage = document.getElementById("accountPage");
    const feed = document.getElementById("feed");
    const stories = document.getElementById("stories");
    const homeStories = document.getElementById("homeStories");
    const dealerRailDrawer = document.getElementById("dealerRailDrawer");
    const homeDrawer = document.getElementById("homeDrawer");
    const homeDrawerGrid = document.getElementById("homeDrawerGrid");
    const homeDrawerTitle = document.getElementById("homeDrawerTitle");
    const homeDrawerMeta = document.getElementById("homeDrawerMeta");
    const progress = document.getElementById("progress");
    const sheet = document.getElementById("sheet");
    const sheetPanel = document.getElementById("sheetPanel");
    const toast = document.getElementById("toast");
    const intro = document.getElementById("intro");
    const signalStrip = document.getElementById("signalStrip");
    const gameDemoStates = {
      Roulette: [
        {
          name: "Betting",
          tone: "live",
          title: "Bet accepted",
          text: "$20 placed on 12, Red and 1st 12.",
          badge: "Bets open",
          stats: [
            { label: "Stake", value: "$20" },
            { label: "Potential", value: "+$90" },
            { label: "Wallet", value: "$1,240" }
          ],
          history: [
            { text: "$20 total", tone: "live" },
            { text: "12 selected", tone: "live" },
            { text: "Timer running", tone: "live" }
          ],
          selectedNumbers: [12],
          selectedOutside: ["red", "dozen1"],
          resultNumber: null,
          resultOutside: [],
          trackTail: ["3", "7", "11", "6", "12"],
          trackColors: ["red", "red", "black", "black", "red"]
        },
        {
          name: "Win",
          tone: "win",
          title: "12 Red hits",
          text: "Payout confirmed. Win +$90 to operator wallet.",
          badge: "Win +$90",
          stats: [
            { label: "Stake", value: "$20" },
            { label: "Payout", value: "+$90", tone: "win" },
            { label: "Wallet", value: "$1,330" }
          ],
          history: [
            { text: "Bet confirmed", tone: "live" },
            { text: "Spin complete", tone: "live" },
            { text: "12 Red", tone: "win" },
            { text: "Paid +$90", tone: "win" }
          ],
          selectedNumbers: [12],
          selectedOutside: ["red", "dozen1"],
          resultNumber: 12,
          resultOutside: ["red", "dozen1"],
          trackTail: ["7", "11", "6", "3", "12"],
          trackColors: ["red", "black", "black", "red", "red"]
        },
        {
          name: "Loss",
          tone: "loss",
          title: "8 Black lands",
          text: "Round settled. Loss -$20, next spin opens in 9s.",
          badge: "Loss -$20",
          stats: [
            { label: "Stake", value: "$20" },
            { label: "Outcome", value: "-$20", tone: "loss" },
            { label: "Wallet", value: "$1,220" }
          ],
          history: [
            { text: "Bet confirmed", tone: "live" },
            { text: "Spin complete", tone: "live" },
            { text: "8 Black", tone: "loss" },
            { text: "Replay available", tone: "live" }
          ],
          selectedNumbers: [12],
          selectedOutside: ["red", "dozen1"],
          resultNumber: 8,
          resultOutside: [],
          trackTail: ["11", "6", "12", "3", "8"],
          trackColors: ["black", "black", "red", "red", "black"]
        }
      ],
      Blackjack: [
        {
          name: "Betting",
          tone: "live",
          title: "Bet accepted",
          text: "$75 main bet confirmed. Decision window is open.",
          badge: "Action on you",
          stats: [
            { label: "Stake", value: "$75" },
            { label: "Potential", value: "+$75" },
            { label: "Wallet", value: "$1,540" }
          ],
          history: [
            { text: "Seat locked", tone: "live" },
            { text: "$75 main bet", tone: "live" },
            { text: "15 total", tone: "live" }
          ],
          dealerHand: [{ rank: "A", suit: "♠" }, { back: true }],
          playerHand: [{ rank: "8", suit: "♦" }, { rank: "7", suit: "♣" }],
          dealerNote: "Soft 16 showing",
          playerNote: "You: 15",
          action: "Stand"
        },
        {
          name: "Win",
          tone: "win",
          title: "Dealer busts 26",
          text: "Stand holds. Win +$75 settled.",
          badge: "Win +$75",
          stats: [
            { label: "Stake", value: "$75" },
            { label: "Payout", value: "+$75", tone: "win" },
            { label: "Wallet", value: "$1,615" }
          ],
          history: [
            { text: "Stand locked", tone: "live" },
            { text: "Dealer reveals 5", tone: "live" },
            { text: "Bust 26", tone: "win" },
            { text: "Paid +$75", tone: "win" }
          ],
          dealerHand: [{ rank: "A", suit: "♠" }, { rank: "5", suit: "♥" }, { rank: "K", suit: "♣" }],
          playerHand: [{ rank: "8", suit: "♦" }, { rank: "7", suit: "♣" }],
          dealerNote: "Dealer draws to 26",
          playerNote: "You: 15",
          action: "Stand"
        },
        {
          name: "Loss",
          tone: "loss",
          title: "Dealer 20 wins",
          text: "Hand settled. Loss -$75, next seat remains open.",
          badge: "Loss -$75",
          stats: [
            { label: "Stake", value: "$75" },
            { label: "Outcome", value: "-$75", tone: "loss" },
            { label: "Wallet", value: "$1,465" }
          ],
          history: [
            { text: "Stand locked", tone: "live" },
            { text: "Dealer flips 10", tone: "live" },
            { text: "Dealer 20", tone: "loss" },
            { text: "Rebet available", tone: "live" }
          ],
          dealerHand: [{ rank: "10", suit: "♠" }, { rank: "Q", suit: "♥" }],
          playerHand: [{ rank: "8", suit: "♦" }, { rank: "7", suit: "♣" }],
          dealerNote: "Dealer stands on 20",
          playerNote: "You: 15",
          action: "Stand"
        }
      ],
      Baccarat: [
        {
          name: "Betting",
          tone: "live",
          title: "Player bet confirmed",
          text: "$100 on Player accepted. Deal starts in 9s.",
          badge: "Deal in 9s",
          stats: [
            { label: "Stake", value: "$100" },
            { label: "Potential", value: "+$100" },
            { label: "Wallet", value: "$2,080" }
          ],
          history: [
            { text: "$100 Player", tone: "live" },
            { text: "Roadmap open", tone: "live" },
            { text: "Shoe live", tone: "live" }
          ],
          selectedBet: "player",
          recentRoad: null,
          scores: { player: "-", tie: "-", banker: "-" }
        },
        {
          name: "Win",
          tone: "win",
          title: "Player 9 beats Banker 8",
          text: "Round settled. Win +$100.",
          badge: "Win +$100",
          stats: [
            { label: "Stake", value: "$100" },
            { label: "Payout", value: "+$100", tone: "win" },
            { label: "Wallet", value: "$2,180" }
          ],
          history: [
            { text: "Player 9", tone: "win" },
            { text: "Banker 8", tone: "live" },
            { text: "Paid +$100", tone: "win" }
          ],
          selectedBet: "player",
          recentRoad: "player",
          scores: { player: "9", tie: "-", banker: "8" }
        },
        {
          name: "Loss",
          tone: "loss",
          title: "Banker 7 beats Player 5",
          text: "Banker streak continues. Loss -$100.",
          badge: "Loss -$100",
          stats: [
            { label: "Stake", value: "$100" },
            { label: "Outcome", value: "-$100", tone: "loss" },
            { label: "Wallet", value: "$1,980" }
          ],
          history: [
            { text: "Player 5", tone: "live" },
            { text: "Banker 7", tone: "loss" },
            { text: "Rebet open", tone: "live" }
          ],
          selectedBet: "player",
          recentRoad: "banker",
          scores: { player: "5", tie: "-", banker: "7" }
        }
      ],
      Poker: [
        {
          name: "Betting",
          tone: "live",
          title: "Pre-flop decision locked",
          text: "$50 enters the hand with the button in view.",
          badge: "Action on you",
          stats: [
            { label: "Stake", value: "$50" },
            { label: "Pot", value: "$140" },
            { label: "Wallet", value: "$1,860" }
          ],
          history: [
            { text: "Button seat", tone: "live" },
            { text: "Heads-up table", tone: "live" },
            { text: "Flop pending", tone: "live" }
          ],
          heroHand: [{ rank: "A", suit: "♠" }, { rank: "Q", suit: "♠" }],
          villainHand: [{ back: true }, { back: true }],
          board: [{ back: true }, { back: true }, { back: true }, { back: true }, { back: true }],
          heroNote: "Hero · Button",
          villainNote: "Villain · Big blind",
          street: "Pre-flop",
          pot: "$140",
          action: "Call"
        },
        {
          name: "Win",
          tone: "win",
          title: "Top pair holds",
          text: "Showdown lands clean and the pot ships back to the seat.",
          badge: "Win +$180",
          stats: [
            { label: "Stake", value: "$50" },
            { label: "Payout", value: "+$180", tone: "win" },
            { label: "Wallet", value: "$2,040" }
          ],
          history: [
            { text: "Flop A-high", tone: "live" },
            { text: "River holds", tone: "win" },
            { text: "Pot shipped", tone: "win" }
          ],
          heroHand: [{ rank: "A", suit: "♠" }, { rank: "Q", suit: "♠" }],
          villainHand: [{ rank: "K", suit: "♦" }, { rank: "Q", suit: "♣" }],
          board: [{ rank: "A", suit: "♦" }, { rank: "9", suit: "♣" }, { rank: "4", suit: "♠" }, { rank: "2", suit: "♥" }, { rank: "9", suit: "♦" }],
          heroNote: "Hero · Two pair",
          villainNote: "Villain · Pair",
          street: "Showdown",
          pot: "$180",
          action: "Raise"
        },
        {
          name: "Loss",
          tone: "loss",
          title: "River pair misses",
          text: "The hand settles against the seat and the room resets quickly.",
          badge: "Loss -$50",
          stats: [
            { label: "Stake", value: "$50" },
            { label: "Outcome", value: "-$50", tone: "loss" },
            { label: "Wallet", value: "$1,810" }
          ],
          history: [
            { text: "Turn checked", tone: "live" },
            { text: "River pairs villain", tone: "loss" },
            { text: "Next hand ready", tone: "live" }
          ],
          heroHand: [{ rank: "J", suit: "♥" }, { rank: "10", suit: "♥" }],
          villainHand: [{ rank: "A", suit: "♣" }, { rank: "10", suit: "♣" }],
          board: [{ rank: "10", suit: "♠" }, { rank: "7", suit: "♦" }, { rank: "2", suit: "♣" }, { rank: "A", suit: "♦" }, { rank: "3", suit: "♥" }],
          heroNote: "Hero · Pair",
          villainNote: "Villain · Two pair",
          street: "River",
          pot: "$110",
          action: "Call"
        }
      ]
    };
    const demoStateByCard = {};
    const liveRoundByCard = {};
    const gameplayMenuByCard = {};
    const gameplayMemoryByCard = {};
    const gameplayEntryByCard = {};
    const gameplayRoomIntroByCard = {};
    const gameplayRefreshTimerByCard = {};
    const gameplayChatByCard = {};
    const cameraCutByCard = {};
    const lastCameraKeyByCard = {};
    let currentSheetType = null;
    let currentView = "home";
    let active = 0;
    let liveRoundTimer = 0;
    let signalTimer = 0;
    let dealerRailOpen = false;
    let dealerRailTimer = 0;
    let homeMenuOpen = false;
    function item() {
      return cards[active];
    }

    function cloneDeep(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function money(value) {
      const amount = Math.round(Number(value || 0) * 100) / 100;
      return amount % 1 === 0 ? `$${amount.toFixed(0)}` : `$${amount.toFixed(2)}`;
    }

    function icon(name) {
      const icons = {
        watch: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>',
        play: '<svg class="inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m10 8 6 4-6 4z"></path></svg>',
        seat: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M7 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M5 18v-3c0-1.1.9-2 2-2h4"></path><path d="M14 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 18v-3c0-1.1.9-2 2-2h4"></path></svg>',
        lang: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18"></path><path d="M3 12h18"></path><path d="M12 3c2.5 2.6 4 5.6 4 9s-1.5 6.4-4 9"></path><path d="M12 3c-2.5 2.6-4 5.6-4 9s1.5 6.4 4 9"></path></svg>',
        limit: '<svg class="inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v8"></path><path d="M9 10c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2"></path></svg>',
        trend: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M4 16 10 10l4 4 6-7"></path><path d="M16 7h4v4"></path></svg>',
        tip: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M12 4v16"></path><path d="M8 8h6a3 3 0 1 1 0 6H10a3 3 0 1 0 0 6h6"></path></svg>',
        chat: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M5 6h14v9H9l-4 3V6Z"></path></svg>',
        menu: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M6 12h.01"></path><path d="M12 12h.01"></path><path d="M18 12h.01"></path></svg>',
        expand: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M3 16v5h5"></path></svg>',
        wallet: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M4 7h14a2 2 0 0 1 2 2v8H4z"></path><path d="M4 7V6a2 2 0 0 1 2-2h10"></path><path d="M16 13h4"></path></svg>',
        history: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6"></path><path d="M4 4v5h5"></path><path d="M12 8v4l3 2"></path></svg>',
        profile: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path d="M5 20c1.8-3.2 11.2-3.2 14 0"></path></svg>',
        info: '<svg class="inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><path d="M12 7h.01"></path></svg>',
        stats: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M5 19V9"></path><path d="M12 19V5"></path><path d="M19 19v-7"></path></svg>',
        shield: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 5 3.4 8.3 7 9 3.6-.7 7-4 7-9V6z"></path></svg>',
        search: '<svg class="inline-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
        cards: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="M7 5h10a2 2 0 0 1 2 2v10H9a2 2 0 0 1-2-2Z"></path><path d="M7 7H6a2 2 0 0 0-2 2v9h9"></path></svg>',
        close: '<svg class="inline-icon" viewBox="0 0 24 24"><path d="m6 6 12 12"></path><path d="M18 6 6 18"></path></svg>'
      };
      return icons[name] || "";
    }

    function entryChip(iconName, value) {
      return `<div class="entry-chip">${icon(iconName)}<strong>${value}</strong></div>`;
    }

    function bankrollBase(card) {
      return gameBankrollBase[card.game] || 0;
    }

    function rouletteNumberColor(value) {
      if (value === 0) return "green";
      const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
      return reds.has(value) ? "red" : "black";
    }

    function rouletteOutsideHits(number) {
      const value = Number(number);
      if (!Number.isFinite(value) || value === 0) return [];
      const hits = [];
      hits.push(rouletteNumberColor(value));
      if (value % 2 === 0) hits.push("even");
      else hits.push("odd");
      if (value <= 18) hits.push("low");
      else hits.push("high");
      if (value <= 12) hits.push("dozen1");
      else if (value <= 24) hits.push("dozen2");
      else hits.push("dozen3");
      const col = value % 3 === 1 ? "col1" : value % 3 === 2 ? "col2" : "col3";
      hits.push(col);
      return hits;
    }

    function defaultGameplayMemory(card) {
      if (card.game === "Blackjack") {
        return {
          stake: 50,
          action: "Stand"
        };
      }
      if (card.game === "Baccarat") {
        return {
          stake: 100,
          selectedBet: "player"
        };
      }
      if (card.game === "Poker") {
        return {
          stake: 50,
          action: "Call"
        };
      }
      return {
        betChip: 10,
        selectedNumbers: [12],
        selectedOutside: ["red", "dozen1"],
        selectedSpecial: [],
        lastNumbers: [12],
        lastOutside: ["red", "dozen1"],
        lastSpecial: [],
        boardView: "main",
        tips: 0
      };
    }

    function gameplayMemory(card) {
      if (!gameplayMemoryByCard[card.id]) {
        gameplayMemoryByCard[card.id] = defaultGameplayMemory(card);
      }
      return gameplayMemoryByCard[card.id];
    }

    function toggleValue(list, value) {
      const index = list.indexOf(value);
      if (index >= 0) list.splice(index, 1);
      else list.push(value);
    }

    function toggleNumberGroup(list, values) {
      const active = values.every((value) => list.includes(value));
      if (active) {
        values.forEach((value) => {
          const index = list.indexOf(value);
          if (index >= 0) list.splice(index, 1);
        });
      } else {
        values.forEach((value) => {
          if (!list.includes(value)) list.push(value);
        });
      }
      list.sort((a, b) => a - b);
    }

    function rememberRouletteSelection(memory) {
      if (memory.selectedNumbers.length || memory.selectedOutside.length || (memory.selectedSpecial || []).length) {
        memory.lastNumbers = [...memory.selectedNumbers];
        memory.lastOutside = [...memory.selectedOutside];
        memory.lastSpecial = [...(memory.selectedSpecial || [])];
      }
    }

    function setCleanView() {
      screen.classList.remove("clean-view");
    }

    function homeTopMarkup() {
      return `
        <div class="home-topbar">
          <div class="home-top-copy">
            <span class="home-top-kicker">Illustrative preview</span>
            <div class="home-top-title">
              <div class="wordmark top-wordmark" aria-label="LC App"><b>LC</b></div>
              <strong>Live rooms</strong>
            </div>
          </div>
          <div class="home-top-actions">
            <button class="icon-btn" type="button" data-home-menu aria-label="Quick actions">${icon("menu")}</button>
          </div>
        </div>
      `;
    }

    function accountTopMarkup() {
      const card = item();
      return `
        <div class="account-topbar">
          <div class="account-top-copy">
            <span class="account-avatar"><img src="${card.image}" alt="Player profile" style="${profileImageStyle(card)}" /></span>
            <div class="account-top-meta">
              <span>Player account</span>
              <strong>Narek · VIP 2</strong>
              <p>Wallet, rooms and limits in one place.</p>
            </div>
          </div>
          <div class="account-top-actions">
            <button class="icon-btn text" type="button" data-sheet="alerts" aria-label="Unread alerts">3</button>
            <button class="icon-btn" type="button" data-sheet="wallet" aria-label="Cashier">${icon("wallet")}</button>
          </div>
        </div>
      `;
    }

    function accountPageMarkup() {
      const card = item();
      const gameIconLabel = gameIconName(card);
      const roomMode = roomModeLabel(card);
      const savedRooms = cards.slice(0, 3).map((room, index) => `
        <button class="account-room-card ${room.id === card.id ? "active" : ""}" type="button" data-account-room="${index}">
          <div class="account-room-top">
            <div class="account-room-meta">
              <strong>${room.table}</strong>
              <span>${room.dealer} · ${room.game} · ${room.language}</span>
            </div>
            <span class="account-room-chip">${room.seat} open</span>
          </div>
          <div class="quick-link-row compact">
            <span class="quick-link">${icon("watch")}${room.watching}</span>
            <span class="quick-link">${icon("trend")}${room.state}</span>
          </div>
        </button>
      `).join("");
      return `
        <div class="account-page-stack">
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill gold">Illustrative account</span>
              <span class="account-hub-tag">${icon("shield")}Operator-owned identity</span>
            </div>
            <div class="account-hub-balance">
              <strong>External</strong>
              <span>Wallet, gameplay and regulated account state.</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("wallet")}No wallet data in LC</span>
              <span class="account-hub-tag">${icon("watch")}3 saved rooms</span>
              <span class="account-hub-tag">${icon("history")}No gameplay results in LC</span>
            </div>
          </div>
          <div class="account-balance-row">
            <div class="account-balance-card primary"><strong>Operator</strong><span>gameplay account</span></div>
            <div class="account-balance-card"><strong>External</strong><span>cashier</span></div>
            <div class="account-balance-card"><strong>Not stored</strong><span>financial data</span></div>
          </div>
          <div class="account-quick-actions">
            <button class="btn" type="button" data-sheet="wallet">Cashier</button>
            <button class="btn secondary" type="button" data-sheet="history">History</button>
            <button class="btn secondary" type="button" data-sheet="saved">Saved rooms</button>
            <button class="btn secondary" type="button" data-sheet="message">Messages</button>
            <button class="btn secondary" type="button" data-sheet="tips">Tips</button>
            <button class="btn secondary" type="button" data-sheet="compliance">Limits</button>
          </div>
          <div class="account-page-section">
            <div class="sheet-section-head"><strong>Current room</strong><span>live</span></div>
            <button class="account-room-card active" type="button" data-account-room="${active}">
              <div class="account-room-top">
                <div class="account-room-meta">
                  <strong>${card.table}</strong>
                  <span>${card.dealer} · ${card.game} · ${card.stakes}</span>
                </div>
                <span class="account-room-chip">${roomMode}</span>
              </div>
              <div class="quick-link-row compact">
                <span class="quick-link">${icon(gameIconLabel)}${card.state}</span>
                <span class="quick-link">${icon("seat")}${card.seat} open</span>
                <span class="quick-link">${icon("watch")}${card.watching}</span>
              </div>
            </button>
            <div class="sheet-actions flush">
              <button class="btn" type="button" data-sheet="watch">Open live room</button>
              <button class="btn secondary" type="button" data-sheet="gameplay">Go to table</button>
            </div>
          </div>
          <div class="account-page-section">
            <div class="sheet-section-head"><strong>Saved rooms</strong><span>return loop</span></div>
            <div class="account-room-list">${savedRooms}</div>
          </div>
          <div class="account-page-section">
            <div class="sheet-section-head"><strong>Account tools</strong><span>core</span></div>
            <div class="module-grid compact-modules">
              ${moduleTile("wallet", "Cashier", { sheet: "wallet" })}
              ${moduleTile("history", "History", { sheet: "history" })}
              ${moduleTile("watch", "Saved rooms", { sheet: "saved" })}
              ${moduleTile("watch", "Alerts", { sheet: "alerts" })}
            </div>
          </div>
          <div class="account-page-section">
            <div class="sheet-section-head"><strong>Safety and messaging</strong><span>control</span></div>
            <div class="module-grid compact-modules">
              ${moduleTile("chat", "Messages", { sheet: "message" })}
              ${moduleTile("tip", "Tips", { sheet: "tips" })}
              ${moduleTile("shield", "Limits", { sheet: "compliance" })}
              ${moduleTile("profile", "Dealer profile", { sheet: "profile" })}
            </div>
          </div>
          <div class="list account-setting-list">
            ${compactListRow("profile", "player id", "Illustrative")}
            ${compactListRow("wallet", "wallet rails", "Licensed operator-owned")}
            ${compactListRow("history", "cashout", "Not stored by LC")}
            ${compactListRow(gameIconLabel, "active room", `${card.dealer} · ${card.table}`)}
          </div>
        </div>
      `;
    }

    function syncNavState() {
      document.querySelectorAll(".nav").forEach((button) => {
        const isViewActive = button.dataset.nav && button.dataset.nav === currentView && currentSheetType !== "watch";
        const isWatchActive = button.dataset.sheet === "watch" && currentSheetType === "watch";
        button.classList.toggle("active", Boolean(isViewActive || isWatchActive));
      });
    }

    function renderViewShell() {
      if (appTop) appTop.innerHTML = currentView === "account" ? accountTopMarkup() : homeTopMarkup();
      if (accountPage) accountPage.innerHTML = accountPageMarkup();
    }

    function setView(view) {
      currentView = view === "account" ? "account" : "home";
      homeMenuOpen = false;
      renderViewShell();
      renderChromeState();
    }

    function homeMenuMarkup() {
      const items = [
        { iconName: "play", label: "Play", sheet: "gameplay", className: "primary" },
        { iconName: "watch", label: "Watch", sheet: "watch" },
        { iconName: "profile", label: "Dealer", sheet: "profile" },
        { iconName: "play", label: "Handoff", sheet: "handoff" },
        { iconName: "trend", label: "Proof", sheet: "insights" },
        { iconName: "watch", label: "Saved", sheet: "saved" },
        { iconName: "wallet", label: "Wallet", sheet: "wallet" },
        { iconName: "history", label: "History", sheet: "history" },
        { iconName: "chat", label: "Message", sheet: "message" },
        { iconName: "tip", label: "Tips", sheet: "tips" },
        { iconName: "watch", label: "Alerts", sheet: "alerts" },
        { iconName: "shield", label: "Limits", sheet: "compliance" },
        { iconName: "search", label: "Explore", sheet: "search" }
      ];
      return items.map((entry) => (
        `<button class="home-menu-btn ${entry.className || ""}" type="button" data-sheet="${entry.sheet}">${icon(entry.iconName)}<span>${entry.label}</span></button>`
      )).join("");
    }

    function rouletteSelectionEntries(memory) {
      const specialKeys = memory.selectedSpecial || [];
      return [
        ...memory.selectedNumbers.map((value) => ({
          type: "number",
          key: `number:${value}`,
          label: String(value),
          shortLabel: String(value),
          payout: 35,
          numbers: [Number(value)]
        })),
        ...memory.selectedOutside.map((key) => ({
          type: "outside",
          key,
          label: rouletteOutsideConfig[key]?.label || key,
          shortLabel: rouletteOutsideConfig[key]?.label || key,
          payout: rouletteOutsideConfig[key]?.payout || 0
        })),
        ...specialKeys
          .filter((key) => rouletteSpecialConfig[key])
          .map((key) => ({
            type: "special",
            key,
            label: rouletteSpecialConfig[key].label,
            shortLabel: rouletteSpecialConfig[key].shortLabel,
            payout: rouletteSpecialConfig[key].payout,
            numbers: rouletteSpecialConfig[key].numbers
          }))
      ];
    }

    function rouletteSelectedCount(memory) {
      return rouletteSelectionEntries(memory).length;
    }

    function rouletteSelectionLabels(memory, compact = false) {
      return rouletteSelectionEntries(memory).map((entry) => compact ? entry.shortLabel : entry.label);
    }

    function rouletteStake(memory) {
      return memory.betChip * rouletteSelectedCount(memory);
    }

    function roulettePotential(memory) {
      return rouletteSelectionEntries(memory)
        .reduce((sum, entry) => sum + (memory.betChip * entry.payout), 0);
    }

    function roulettePayout(memory, state) {
      const result = Number(state.resultNumber);
      if (!Number.isFinite(result)) return 0;
      const outsideHits = [...(state.resultOutside || []), ...rouletteOutsideHits(result)];
      return rouletteSelectionEntries(memory).reduce((sum, entry) => {
        if (entry.type === "outside") {
          return outsideHits.includes(entry.key) ? sum + (memory.betChip * entry.payout) : sum;
        }
        return entry.numbers?.includes(result) ? sum + (memory.betChip * entry.payout) : sum;
      }, 0);
    }

    function rouletteChipValue(memory) {
      return String(memory.betChip);
    }

    function betChipTone(value) {
      if (value <= 5) return "emerald";
      if (value <= 25) return "cobalt";
      if (value <= 100) return "ruby";
      return "violet";
    }

    function betChipRailMarkup(values, activeValue) {
      return `
        <div class="bet-chip-rail">
          ${values.map((value) => `
            <button class="bet-chip-token tone-${betChipTone(value)} ${activeValue === value ? "active" : ""}" type="button" data-bet-chip="${value}" data-tap-feedback>
              <b>${money(value)}</b>
            </button>
          `).join("")}
        </div>
      `;
    }

    function rouletteGroupToggleState(memory, keys) {
      return keys.length > 0 && keys.every((key) => (memory.selectedSpecial || []).includes(key));
    }

    function rouletteSpecialButtonMarkup(keys, label, meta = "") {
      const memory = gameplayMemory(item());
      const active = rouletteGroupToggleState(memory, keys);
      return `<button class="roulette-special-chip ${active ? "chipped" : ""}" type="button" data-roulette-group="${keys.join(",")}" data-chip-value="${rouletteChipValue(memory)}" data-tap-feedback><b>${label}</b>${meta ? `<small>${meta}</small>` : ""}</button>`;
    }

    function rouletteNumberGroupActive(memory, numbers) {
      return numbers.length > 0 && numbers.every((value) => memory.selectedNumbers.includes(value));
    }

    function rouletteNumberGroupMarkup(memory, numbers, label, meta = "") {
      const active = rouletteNumberGroupActive(memory, numbers);
      return `<button class="roulette-special-chip ${active ? "chipped" : ""}" type="button" data-roulette-numbers="${numbers.join(",")}" ${active ? `data-chip-value="${rouletteChipValue(memory)}"` : ""} data-tap-feedback><b>${label}</b>${meta ? `<small>${meta}</small>` : ""}</button>`;
    }

    function rouletteSelectionStripMarkup(memory, { compact = false, max = 6, liveFirst = false } = {}) {
      const labels = rouletteSelectionLabels(memory, compact);
      if (!labels.length) return "";
      const visible = labels.slice(0, max);
      const extra = labels.length - visible.length;
      return `
        <div class="roulette-selection-strip">
          ${visible.map((label, index) => `<span class="${liveFirst && index === 0 ? "live" : ""}">${label}</span>`).join("")}
          ${extra > 0 ? `<span>+${extra}</span>` : ""}
        </div>
      `;
    }

    function cameraFrame(card, shotKey) {
      const defaults = {
        Roulette: {
          dealer: { mediaPosition: "center 15%", mediaScale: 1.05, mediaFilter: "saturate(1.06) contrast(1.05)", focusBottom: 248, focusHeight: 182, focusOpacity: .18, focusScale: .98 },
          table: { mediaPosition: "center 34%", mediaScale: 1.18, mediaFilter: "saturate(1.1) contrast(1.06) brightness(.9)", focusBottom: 164, focusHeight: 154, focusOpacity: .4, focusScale: 1 },
          reveal: { mediaPosition: "center 38%", mediaScale: 1.22, mediaFilter: "saturate(1.08) contrast(1.06) brightness(.98)", focusBottom: 180, focusHeight: 122, focusOpacity: .46, focusScale: 1.02 }
        },
        Blackjack: {
          dealer: { mediaPosition: "center 15%", mediaScale: 1.03, mediaFilter: "saturate(1.06) contrast(1.05)", videoPosition: "center 50%", videoScale: .94, focusBottom: 250, focusHeight: 184, focusOpacity: .18, focusScale: .97 },
          table: { mediaPosition: "center 40%", mediaScale: 1.19, mediaFilter: "saturate(1.08) contrast(1.06) brightness(.93)", videoPosition: "center 68%", videoScale: .78, focusBottom: 150, focusHeight: 160, focusOpacity: .42, focusScale: 1 },
          reveal: { mediaPosition: "center 35%", mediaScale: 1.16, mediaFilter: "saturate(1.08) contrast(1.08) brightness(.98)", videoPosition: "center 72%", videoScale: .7, focusBottom: 168, focusHeight: 124, focusOpacity: .5, focusScale: 1.03 }
        },
        Baccarat: {
          dealer: { mediaPosition: "center 15%", mediaScale: 1.03, mediaFilter: "saturate(1.06) contrast(1.05)", focusBottom: 250, focusHeight: 184, focusOpacity: .18, focusScale: .97 },
          table: { mediaPosition: "center 37%", mediaScale: 1.17, mediaFilter: "saturate(1.08) contrast(1.06) brightness(.94)", focusBottom: 168, focusHeight: 148, focusOpacity: .38, focusScale: 1 },
          reveal: { mediaPosition: "center 33%", mediaScale: 1.14, mediaFilter: "saturate(1.08) contrast(1.06) brightness(.98)", focusBottom: 190, focusHeight: 118, focusOpacity: .44, focusScale: 1.02 }
        },
        Poker: {
          dealer: { mediaPosition: "center 15%", mediaScale: 1.03, mediaFilter: "saturate(1.05) contrast(1.05)", focusBottom: 248, focusHeight: 182, focusOpacity: .18, focusScale: .97 },
          table: { mediaPosition: "center 39%", mediaScale: 1.16, mediaFilter: "saturate(1.06) contrast(1.05) brightness(.94)", focusBottom: 166, focusHeight: 144, focusOpacity: .4, focusScale: 1 },
          reveal: { mediaPosition: "center 33%", mediaScale: 1.14, mediaFilter: "saturate(1.08) contrast(1.06) brightness(.98)", focusBottom: 186, focusHeight: 116, focusOpacity: .46, focusScale: 1.02 }
        }
      };
      return {
        ...(defaults[card.game]?.[shotKey] || defaults.Roulette.dealer),
        ...(dealerFramePresets[card.id]?.[shotKey] || {})
      };
    }

    function cameraViewportFactor() {
      return window.innerWidth <= 480 ? 0.86 : 1;
    }

    function mediaStyle(card, frame) {
      const viewportFactor = window.innerWidth <= 480 ? 0.98 : 1;
      const preset = dealerFeedPreset(card);
      const hasStream = Boolean(card.gameplayVideo || card.tableVideo || card.watchVideo);
      const useNeutralStage = hasStream && (Boolean(preset.neutralGameplayStage) || (frame.videoFit || preset.gameplayVideoFit) === "contain");
      return [
        useNeutralStage
          ? "background:radial-gradient(circle at 50% 18%, rgba(255,255,255,.06), transparent 24%), linear-gradient(180deg, rgba(16, 12, 16, .74), rgba(5, 6, 9, .94) 58%, rgba(2, 3, 5, .98))"
          : `background-image:url('${card.image}')`,
        `background-position:${frame.mediaPosition}`,
        `transform:scale(${useNeutralStage ? 1 : Math.max(1, frame.mediaScale * viewportFactor)})`,
        `filter:${useNeutralStage ? "none" : (frame.mediaFilter || "saturate(1.06) contrast(1.05)")}`
      ].join(";");
    }

    function focusStyle(frame) {
      const viewportFactor = cameraViewportFactor();
      return [
        `bottom:${Math.round(frame.focusBottom * viewportFactor)}px`,
        `height:${Math.round(frame.focusHeight * viewportFactor)}px`,
        `opacity:${frame.focusOpacity}`,
        `transform:scale(${frame.focusScale})`
      ].join(";");
    }

    function closeButton() {
      return `<button class="close" type="button" data-close aria-label="Close">${icon("close")}</button>`;
    }

    let toastTimer = 0;

    function showToast(message) {
      if (!toast || !message) return;
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add("show");
      toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1300);
    }

    function hideIntro(message = true) {
      if (!intro || intro.classList.contains("hidden")) return;
      intro.classList.add("hidden");
      intro.setAttribute("aria-hidden", "true");
      if (message) showToast("Demo mode. No real-money transactions.");
    }

    function signalState(card) {
      const signals = [
        { label: "Live", text: `${card.table} now live` },
        { label: "Seats", text: `${card.seat} seats open · ${card.language}` },
        { label: "Limits", text: `${card.stakes} table limits` },
        { label: "Session", text: `${card.watching} · illustrative content` },
        { label: "Status", text: `${card.state}` }
      ];
      const index = Math.floor(Date.now() / 4200) % signals.length;
      return signals[index];
    }

    function updateSignal() {
      if (!signalStrip) return;
      const badge = signalStrip.querySelector("b");
      const label = signalStrip.querySelector("span");
      const state = signalState(item());
      if (badge) badge.textContent = state.label;
      if (label) label.textContent = state.text;
    }

    function startSignalTimer() {
      window.clearInterval(signalTimer);
      updateSignal();
      signalTimer = window.setInterval(updateSignal, 4200);
    }

    function demoStates(card) {
      return gameDemoStates[card.game] || [];
    }

    function demoStateIndex(card) {
      return demoStateByCard[card.id] ?? 0;
    }

    function demoState(card) {
      return demoStates(card)[demoStateIndex(card)] || demoStates(card)[0];
    }

    function isLiveRound(card) {
      return liveRoundByCard[card.id] ?? true;
    }

    function roundPhases(card) {
      if (card.game === "Blackjack") {
        return [
          { title: "Seat", text: "Bet locked" },
          { title: "Decision", text: "Player action" },
          { title: "Settle", text: "Payout" }
        ];
      }
      if (card.game === "Baccarat") {
        return [
          { title: "Choose", text: "Side bet" },
          { title: "Reveal", text: "Cards open" },
          { title: "Settle", text: "Road update" }
        ];
      }
      if (card.game === "Poker") {
        return [
          { title: "Pre-flop", text: "Seat action" },
          { title: "Board", text: "Community cards" },
          { title: "Showdown", text: "Pot settles" }
        ];
      }
      return [
        { title: "Bet", text: "Chips on felt" },
        { title: "Spin", text: "Wheel live" },
        { title: "Settle", text: "Result paid" }
      ];
    }

    function sessionModeLabel(card) {
      if (card.game === "Blackjack") return "Seat";
      if (card.game === "Baccarat") return "Shoe";
      if (card.game === "Poker") return "Hand";
      return "Round";
    }

    function isGameplayMenuOpen(card) {
      return gameplayMenuByCard[card.id] ?? false;
    }

    function gameplayStatusMarkup(card, state, camera) {
      return `
        <div class="gameplay-status-card compact ${state.tone}">
          <span class="gameplay-status-chip">${card.game}</span>
          <b class="gameplay-status-badge">${state.badge}</b>
        </div>
      `;
    }

    function gameplayChatMarkup(card, state) {
      const lines = card.game === "Blackjack"
        ? [
            { user: "seat2", text: state.name === "Betting" ? "waiting on action" : state.badge.toLowerCase() },
            { user: "vip", text: `${card.dealer} keeps the felt clear` },
            { user: "pit", text: "dealer cam open" }
          ]
        : card.game === "Poker"
          ? [
              { user: "button", text: state.name === "Betting" ? "pre-flop in view" : state.badge.toLowerCase() },
              { user: "board", text: "community cards stay readable" },
              { user: "table", text: `${card.dealer} keeps the board clean` }
            ]
        : card.game === "Baccarat"
          ? [
              { user: "banker", text: state.name === "Betting" ? "side locked, shoe calm" : state.badge.toLowerCase() },
              { user: "road", text: "road update reads fast" },
              { user: "table", text: `${card.dealer} keeps the squeeze visible` }
            ]
          : [
              { user: "spin", text: state.name === "Betting" ? "map locked, waiting on spin" : state.badge.toLowerCase() },
              { user: "wheel", text: "wheel view stays open" },
              { user: "table", text: `${card.dealer} stays clear of the HUD` }
            ];
      return `
        <div class="gameplay-chat-panel">
          <div class="gameplay-chat-head"><strong>Room</strong><span>live</span></div>
          <div class="gameplay-chat-list">
            ${lines.map((line) => `<div class="gameplay-chat-msg"><b>${line.user}</b>${line.text}</div>`).join("")}
          </div>
        </div>
      `;
    }

    function cameraPlan(card) {
      if (card.game === "Blackjack") {
        return [
          { key: "dealer", label: "Dealer cam", note: "Open on dealer face and seat status before the first card lands." },
          { key: "table", label: "Deal cam", note: "Cut lower to the felt so the player sees the cards being dealt." },
          { key: "reveal", label: "Reveal cam", note: "Tighten on the cards when the dealer flips and the hand settles." }
        ];
      }
      if (card.game === "Baccarat") {
        return [
          { key: "dealer", label: "Dealer cam", note: "Keep the dealer read visible while the side is still being chosen." },
          { key: "table", label: "Deal cam", note: "Move to the table when Player and Banker cards are dealt." },
          { key: "reveal", label: "Reveal cam", note: "Hold on the reveal so the final score reads instantly." }
        ];
      }
      if (card.game === "Poker") {
        return [
          { key: "dealer", label: "Dealer cam", note: "Open on the dealer and seat context before the hand starts." },
          { key: "table", label: "Board cam", note: "Drop lower so the board and hero cards stay visible." },
          { key: "reveal", label: "Showdown cam", note: "Hold on the board and villain reveal when the pot settles." }
        ];
      }
      return [
        { key: "dealer", label: "Dealer cam", note: "Lead with the dealer while bets are still open." },
        { key: "table", label: "Wheel cam", note: "Switch to the wheel the moment the spin starts." },
        { key: "reveal", label: "Result cam", note: "Tighten on the result once the ball lands and settlement begins." }
      ];
    }

    function activeCameraIndex(card, state) {
      if (card.game === "Roulette") {
        if (state.name === "Betting") return 0;
        if (state.name === "Win") return 1;
        return 2;
      }
      if (card.game === "Blackjack") {
        if (gameplayEntry(card) || roomIntro(card)) return 0;
        if (state.name === "Betting") return 1;
        return 2;
      }
      if (state.name === "Betting") return 0;
      if (state.name === "Win") return 1;
      return 2;
    }

    function cameraDirector(card, state) {
      const shots = cameraPlan(card);
      const activeIndex = Math.max(0, Math.min(shots.length - 1, activeCameraIndex(card, state)));
      const activeShot = shots[activeIndex];
      const frame = cameraFrame(card, activeShot.key);
      return {
        shots,
        activeIndex,
        activeShot,
        className: `camera-${activeShot.key}`,
        frame,
        mediaStyle: mediaStyle(card, frame),
        focusStyle: focusStyle(frame)
      };
    }

    function gameplayEntry(card) {
      const entry = gameplayEntryByCard[card.id];
      if (!entry) return null;
      if (Date.now() - entry.time > 900) return null;
      return entry;
    }

    function roomIntro(card) {
      const intro = gameplayRoomIntroByCard[card.id];
      if (!intro) return null;
      if (Date.now() - intro.time > 1720) return null;
      return intro;
    }

    function activeCameraCut(card) {
      const cut = cameraCutByCard[card.id];
      if (!cut) return null;
      if (Date.now() - cut.time > 820) return null;
      return cut;
    }

    function scheduleGameplayRefresh(card, delay, expectedSheet = "gameplay") {
      window.clearTimeout(gameplayRefreshTimerByCard[card.id]);
      gameplayRefreshTimerByCard[card.id] = window.setTimeout(() => {
        if (currentSheetType !== expectedSheet) return;
        if (item().id !== card.id) return;
        refreshSheet();
      }, delay);
    }

    function syncCameraState(card, announce = false) {
      const camera = cameraDirector(card, demoState(card));
      const previousKey = lastCameraKeyByCard[card.id];
      if (announce && previousKey && previousKey !== camera.activeShot.key) {
        cameraCutByCard[card.id] = {
          time: Date.now()
        };
        scheduleGameplayRefresh(card, 860);
      }
      lastCameraKeyByCard[card.id] = camera.activeShot.key;
    }

    function markGameplayEntry(card, source = "feed") {
      gameplayEntryByCard[card.id] = {
        time: Date.now(),
        source
      };
      gameplayRoomIntroByCard[card.id] = {
        time: Date.now(),
        source
      };
      syncCameraState(card, false);
      scheduleGameplayRefresh(card, 1780);
    }

    function dataAttrs(dataset = {}) {
      return Object.entries(dataset)
        .map(([key, value]) => `data-${key}="${String(value).replace(/"/g, "&quot;")}"`)
        .join(" ");
    }

    function compactMetric(iconName, value, label, className = "") {
      return `
        <div class="metric compact ${className}">
          <span class="metric-badge">${icon(iconName)}</span>
          <strong>${value}</strong>
          <span>${label}</span>
        </div>
      `;
    }

    function compactListRow(iconName, label, value) {
      return `
        <div class="list-row compact">
          <span class="list-row-label">${icon(iconName)}<b>${label}</b></span>
          <span>${value}</span>
        </div>
      `;
    }

    function moduleTile(iconName, label, dataset = {}, className = "") {
      return `
        <button class="module-card ${className}" type="button" ${dataAttrs(dataset)}>
          ${icon(iconName)}
          <strong>${label}</strong>
        </button>
      `;
    }

    function gameIconName(card) {
      return card.game === "Poker" ? "cards" : "play";
    }

    function dealerRoleLabel(card) {
      return card.game === "Poker" ? "Poker host" : `${card.game} dealer`;
    }

    function roomModeLabel(card) {
      if (card.game === "Poker") return "Heads-up room";
      if (card.game === "Blackjack") return "Seat-first room";
      if (card.game === "Baccarat") return "Road-first room";
      return "Wheel-first room";
    }

    function roomSignalLabel(card) {
      if (card.game === "Poker") return "Board read";
      if (card.game === "Blackjack") return "Deal read";
      if (card.game === "Baccarat") return "Road rhythm";
      return "Wheel read";
    }

    function suitToneClass(entry) {
      if (!entry || entry.back || !entry.suit) return "";
      return /[♥♦]/.test(entry.suit) ? "suit-red" : "suit-black";
    }

    function miniCardMarkup(entry, className = "", delayMs = 0) {
      const inlineStyle = delayMs ? ` style="animation-delay:${delayMs}ms"` : "";
      if (entry.back) {
        return `<div class="stream-mini-card back ${className}"${inlineStyle}>?</div>`;
      }
      const tone = suitToneClass(entry);
      return `<div class="stream-mini-card ${className} ${tone}"${inlineStyle}>${entry.rank}<small>${entry.suit}</small></div>`;
    }

    function cinematicPreset(card) {
      return dealerCinematicPresets[card.id] || {
        label: "Live table",
        note: "The feed shifts toward the table at the key decision moment."
      };
    }

    function dealerMotionPreset(card) {
      return dealerMotionPresets[card.id] || {
        idle: 7.6,
        breath: 5.2,
        driftX: 9,
        driftY: 10,
        sweep: 1.4,
        wheel: 2.6,
        deal: .4,
        reveal: .44,
        cardEnter: .34,
        score: 1.45,
        road: 1.35,
        spin: 2.2,
        settle: 1.08,
        cardStep: 64,
        revealDelay: 160,
        phaseMs: { Betting: 2400, Win: 2140, Loss: 1920 }
      };
    }

    function dealerFeedPreset(card) {
      return dealerFeedPresets[card.id] || {
        floor: "Live floor",
        hook: "Dealer-led discovery",
        glance: "Dealer identity leads the first impression and the table takes over once the action starts.",
        feedPosition: "center 16%",
        profilePosition: "center 18%",
        overlay: {
          dealer: ["Dealer read", "Table open", "Entry live"],
          table: ["Table move", "Action live", "Player focus"],
          reveal: ["Result read", "Settlement", "Next round"]
        }
      };
    }

    function feedImageStyle(card) {
      const preset = dealerFeedPreset(card);
      return [
        `object-position:${preset.feedPosition || "center 16%"}`,
        `transform:scale(${preset.feedScale || 1})`,
        `filter:${preset.feedFilter || "contrast(1.03) saturate(1.02)"}`
      ].join(";");
    }

    function profileImageStyle(card) {
      const preset = dealerFeedPreset(card);
      return `object-position:${preset.profilePosition || preset.feedPosition || "center 18%"}`;
    }

    function profileBackdropStyle(card) {
      const preset = dealerFeedPreset(card);
      return `background-image:url('${card.image}');background-position:${preset.profilePosition || preset.feedPosition || "center 18%"}`;
    }

    function watchVideoStyle(card) {
      const preset = dealerFeedPreset(card);
      return [
        `object-position:${preset.watchPosition || preset.profilePosition || preset.feedPosition || "center 18%"}`,
        `transform:scale(${preset.watchScale || 1.04})`,
        `filter:${preset.watchFilter || "saturate(1.06) contrast(1.04) brightness(.92)"}`
      ].join(";");
    }

    function gameplayVideoStyle(card, camera) {
      const preset = dealerFeedPreset(card);
      const frame = camera.frame || {};
      return [
        `object-fit:${frame.videoFit || preset.gameplayVideoFit || "cover"}`,
        `object-position:${frame.videoPosition || preset.gameplayVideoPosition || frame.mediaPosition || preset.feedPosition || "center 20%"}` ,
        `transform:scale(${frame.videoScale || preset.gameplayVideoScale || 1.02})`,
        `filter:${frame.videoFilter || preset.gameplayVideoFilter || frame.mediaFilter || "saturate(1.06) contrast(1.04) brightness(.95)"}`
      ].join(";");
    }

    function safeVideoPlay(video) {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(() => {});
    }

    function providerCaptureMatteMarkup(mode) {
      return `<div class="provider-capture-matte ${mode}" aria-hidden="true"></div>`;
    }

    function feedVideoMarkup(card) {
      if (!card.feedVideo) return "";
      return `<video data-live-feed-video autoplay muted loop playsinline preload="metadata" poster="${card.image}" style="${feedImageStyle(card)}" aria-hidden="true"><source src="${card.feedVideo}" type="video/mp4" /></video>`;
    }

    function watchHeroMediaMarkup(card) {
      const fallback = `<img src="${card.image}" alt="${card.dealer} table preview" style="${profileImageStyle(card)}" />`;
      const streamSrc = card.watchVideo || card.tableVideo || card.feedVideo;
      if (!streamSrc) return fallback;
      return `${fallback}<video data-sheet-stream-video autoplay muted loop playsinline preload="metadata" poster="${card.image}" style="${watchVideoStyle(card)}" aria-hidden="true"><source src="${streamSrc}" type="video/mp4" /></video>`;
    }

    function gameplayVideoMarkup(card, camera) {
      const streamSrc = card.gameplayVideo || card.tableVideo || card.watchVideo;
      if (!streamSrc) return "";
      return `<video data-sheet-stream-video autoplay muted loop playsinline preload="metadata" poster="${card.image}" style="${gameplayVideoStyle(card, camera)}" aria-hidden="true"><source src="${streamSrc}" type="video/mp4" /></video>`;
    }

    function syncStreamPlayback() {
      const sheetStreamActive = Boolean(currentSheetType && ["watch", "gameplay"].includes(currentSheetType));
      document.querySelectorAll('[data-live-feed-video]').forEach((video) => {
        const cardNode = video.closest('.live-card');
        const isActiveCard = cardNode && Number(cardNode.dataset.index) === active;
        if (!sheetStreamActive && isActiveCard) safeVideoPlay(video);
        else video.pause();
      });
      document.querySelectorAll('[data-sheet-stream-video]').forEach((video) => {
        if (sheet.contains(video)) safeVideoPlay(video);
        else video.pause();
      });
    }

    function renderChromeState() {
      if (screen) {
        screen.classList.toggle("sheet-active", Boolean(currentSheetType));
        screen.classList.toggle("watch-active", currentSheetType === "watch");
        screen.classList.toggle("gameplay-active", currentSheetType === "gameplay");
        screen.classList.toggle("view-home", currentView === "home");
        screen.classList.toggle("view-account", currentView === "account");
      }
      if (homeView) homeView.setAttribute("aria-hidden", currentView === "account" ? "true" : "false");
      if (accountPage) accountPage.setAttribute("aria-hidden", currentView === "account" ? "false" : "true");
      if (dealerRailDrawer) dealerRailDrawer.classList.toggle("open", dealerRailOpen && currentView === "home");
      if (homeDrawer) {
        const visible = homeMenuOpen && currentView === "home";
        homeDrawer.classList.toggle("open", visible);
        homeDrawer.setAttribute("aria-hidden", visible ? "false" : "true");
      }
      const card = item();
      if (homeDrawerGrid) homeDrawerGrid.innerHTML = homeMenuMarkup();
      if (homeDrawerTitle) homeDrawerTitle.textContent = `${card.dealer} · ${card.table}`;
      if (homeDrawerMeta) homeDrawerMeta.textContent = `${card.operator} · ${card.game} · ${card.stakes}`;
      syncNavState();
    }

    function closeHomeMenu() {
      homeMenuOpen = false;
      renderChromeState();
    }

    function toggleHomeMenu() {
      if (currentView !== "home") return;
      homeMenuOpen = !homeMenuOpen;
      renderChromeState();
    }

    function revealDealerRail(duration = 1800) {
      homeMenuOpen = false;
      dealerRailOpen = true;
      renderChromeState();
      window.clearTimeout(dealerRailTimer);
      if (duration > 0) {
        dealerRailTimer = window.setTimeout(() => {
          dealerRailOpen = false;
          renderChromeState();
        }, duration);
      }
    }

    function isGameplayChatOpen(card) {
      return gameplayChatByCard[card.id] ?? false;
    }

    function stageMotionStyle(card) {
      const motion = dealerMotionPreset(card);
      return [
        `--stage-idle-duration:${motion.idle}s`,
        `--stage-breath-duration:${motion.breath}s`,
        `--stage-drift-x:${motion.driftX}px`,
        `--stage-drift-y:${motion.driftY}px`,
        `--stage-parallax-duration:${Math.max(5.8, motion.idle - 1.1)}s`,
        `--stream-sweep-duration:${motion.sweep}s`,
        `--wheel-orbit-duration:${motion.wheel}s`,
        `--card-enter-duration:${motion.cardEnter}s`,
        `--deal-duration:${motion.deal}s`,
        `--reveal-duration:${motion.reveal}s`,
        `--score-float-duration:${motion.score}s`,
        `--road-pulse-duration:${motion.road}s`,
        `--roulette-spin-duration:${motion.spin}s`,
        `--roulette-settle-duration:${motion.settle}s`
      ].join(";");
    }

    function feedMotionStyle(card) {
      const motion = dealerMotionPreset(card);
      return [
        `--feed-parallax-duration:${Math.max(7.2, motion.idle)}s`,
        `--feed-drift-x:${Math.max(8, motion.driftX)}px`,
        `--feed-drift-y:${Math.max(6, Math.round(motion.driftY * .8))}px`
      ].join(";");
    }

    function liveRoundDelay(card) {
      return dealerMotionPreset(card).phaseMs?.[demoState(card).name] || 2400;
    }

    function roomIntroPreset(card) {
      return dealerRoomIntroPresets[card.id] || {
        title: `${card.dealer} opens the room on the dealer shot and lets the table take over once the action starts.`,
        note: "The intro is brief so the stream remains the main element on screen.",
        tags: ["Live room", "Fast entry", "Stream first"]
      };
    }

    function revealMicrostatePreset(card) {
      return dealerRevealMicrostates[card.id] || {
        win: ["Reveal lands", "Settlement confirms", "Next round armed"],
        loss: ["Reveal lands", "Result confirmed", "Next round armed"]
      };
    }

    function roomIntroStreamOverlay(card, camera, intro) {
      const preset = roomIntroPreset(card);
      const tags = [camera.activeShot.label, ...(preset.tags || [])]
        .slice(0, 2)
        .map((tag, index) => `<span class="${index === 0 ? "live" : ""}">${tag}</span>`)
        .join("");
      return `
        <div class="gameplay-stream-layer align-right dealer-shot">
          <div class="stream-layer-shell intro">
            <div class="stream-layer-kicker"><span>${intro.source === "watch" ? "Back in room" : "Opening room"}</span><b>${card.dealer}</b></div>
            <div class="stream-room-tags">${tags}</div>
          </div>
        </div>
      `;
    }

    function revealMicrostateMarkup(card, state, camera) {
      if (state.name === "Betting") return "";
      const preset = revealMicrostatePreset(card);
      const steps = state.tone === "win" ? preset.win : preset.loss;
      const activeIndex = camera.activeShot.key === "reveal" ? 2 : camera.activeShot.key === "table" ? 1 : 0;
      return `
        <div class="stream-microstate-strip">
          ${steps.map((label, index) => `<span class="stream-microstate-pill ${index < activeIndex ? "done" : ""} ${index === activeIndex ? "active" : ""}">${label}</span>`).join("")}
        </div>
      `;
    }

    function tableOverlayMarkup(card, state, camera) {
      return "";
    }

    function rouletteStreamOverlay(card, state, camera) {
      const preset = cinematicPreset(card);
      const memory = gameplayMemory(card);
      const chips = state.selectionText
        ? state.selectionText.split(", ").slice(0, 2).map((label) => `<span>${label}</span>`).join("")
        : "<span>Quick pick open</span>";
      const headline = camera.activeShot.key === "dealer"
        ? state.badge
        : camera.activeShot.key === "table"
          ? "Wheel live"
          : `${state.resultNumber ?? "?"} settles`;
      if (camera.activeShot.key === "dealer") {
        return `
          <div class="gameplay-stream-layer align-right dealer-shot">
            <div class="stream-layer-shell minimal">
              <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
              <div class="stream-layer-headline">${headline}</div>
              <div class="stream-layer-strip">${chips}<span>${money(memory.betChip)} chip</span></div>
            </div>
          </div>
        `;
      }
      return `
        <div class="gameplay-stream-layer ${camera.activeShot.key === "reveal" ? "align-right" : ""}">
          <div class="stream-layer-shell">
            <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
            <div class="stream-layer-headline">${headline}</div>
            <div class="stream-cinematic-zone">
              <div class="stream-wheel-orbit ${state.resultNumber !== null ? "settle" : ""}">
                <i></i><i></i><i></i>
              </div>
              <div class="stream-layer-strip">${chips}${state.resultNumber !== null ? `<span>${state.resultNumber} live</span>` : ""}</div>
            </div>
            ${revealMicrostateMarkup(card, state, camera)}
          </div>
        </div>
      `;
    }

    function blackjackStreamOverlay(card, state, camera) {
      const preset = cinematicPreset(card);
      const motion = dealerMotionPreset(card);
      const dealerCards = (state.dealerHand || []).map((entry, index) => {
        const className = entry.back ? "" : (state.name === "Betting" ? "" : (index === 1 ? "reveal" : "deal"));
        const delay = entry.back ? 0 : (index === 1 && state.name !== "Betting" ? motion.revealDelay : index * motion.cardStep);
        return miniCardMarkup(entry, className, delay);
      }).join("");
      const playerCards = (state.playerHand || []).map((entry, index) => {
        const className = index >= 2 ? "deal" : "";
        return miniCardMarkup(entry, className, (index + 1) * motion.cardStep);
      }).join("");
      const headline = camera.activeShot.key === "dealer"
        ? `${state.badge}`
        : camera.activeShot.key === "table"
          ? "Deal live"
          : "Reveal live";
      if (camera.activeShot.key === "dealer") {
        return `
          <div class="gameplay-stream-layer align-right dealer-shot">
            <div class="stream-layer-shell minimal">
              <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
              <div class="stream-layer-headline">${headline}</div>
              <div class="stream-layer-strip"><span>${state.playerNote}</span><span>${money(memory.stake)}</span></div>
            </div>
          </div>
        `;
      }
      return `
        <div class="gameplay-stream-layer ${camera.activeShot.key === "reveal" ? "align-right" : "align-center"}">
          <div class="stream-layer-shell">
            <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
            <div class="stream-layer-headline">${headline}</div>
            <div class="stream-cinematic-zone">
              <div class="stream-card-stage">
                <div class="stream-card-row">${dealerCards}</div>
                <div class="stream-card-row">${playerCards}</div>
              </div>
              <div class="stream-layer-strip"><span>${state.playerNote}</span><span>${state.action} queued</span></div>
            </div>
            ${revealMicrostateMarkup(card, state, camera)}
          </div>
        </div>
      `;
    }

    function baccaratStreamOverlay(card, state, camera) {
      const preset = cinematicPreset(card);
      const road = [...(card.baccaratRoad || []).slice(-5), ...(state.recentRoad ? [state.recentRoad] : [])]
        .slice(-6)
        .map((entry, index, array) => `<i class="${entry} ${index === array.length - 1 && state.recentRoad ? "recent" : ""}"></i>`)
        .join("");
      const headline = camera.activeShot.key === "dealer"
        ? `${state.badge}`
        : camera.activeShot.key === "table"
          ? "Cards live"
          : "Result live";
      if (camera.activeShot.key === "dealer") {
        return `
          <div class="gameplay-stream-layer align-right dealer-shot">
            <div class="stream-layer-shell minimal">
              <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
              <div class="stream-layer-headline">${headline}</div>
              <div class="stream-layer-strip"><span>${state.selectedBet}</span><span>${money(memory.stake)}</span></div>
            </div>
          </div>
        `;
      }
      return `
        <div class="gameplay-stream-layer ${camera.activeShot.key === "reveal" ? "align-right" : ""}">
          <div class="stream-layer-shell">
            <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
            <div class="stream-layer-headline">${headline}</div>
            <div class="stream-cinematic-zone">
              <div class="stream-side-score">
                <div class="stream-side-pill player ${state.selectedBet === "player" ? "active" : ""}"><strong>${state.scores.player}</strong><span>Player</span></div>
                <div class="stream-side-pill tie ${state.selectedBet === "tie" ? "active" : ""}"><strong>${state.scores.tie}</strong><span>Tie</span></div>
                <div class="stream-side-pill banker ${state.selectedBet === "banker" ? "active" : ""}"><strong>${state.scores.banker}</strong><span>Banker</span></div>
              </div>
              <div class="stream-road-strip">${road}</div>
            </div>
            ${revealMicrostateMarkup(card, state, camera)}
          </div>
        </div>
      `;
    }

    function pokerStreamOverlay(card, state, camera) {
      const preset = cinematicPreset(card);
      const motion = dealerMotionPreset(card);
      const heroCards = (state.heroHand || []).map((entry, index) => miniCardMarkup(entry, index > 0 ? "deal" : "", index * motion.cardStep)).join("");
      const boardCards = (state.board || []).map((entry, index) => {
        const className = entry.back ? "" : (state.name === "Betting" ? "" : (index >= 3 ? "reveal" : "deal"));
        return miniCardMarkup(entry, className, index * Math.max(42, motion.cardStep - 6));
      }).join("");
      const headline = camera.activeShot.key === "dealer"
        ? `${state.badge}`
        : camera.activeShot.key === "table"
          ? state.street || "Board live"
          : "Showdown live";
      if (camera.activeShot.key === "dealer") {
        return `
          <div class="gameplay-stream-layer align-right dealer-shot">
            <div class="stream-layer-shell minimal">
              <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
              <div class="stream-layer-headline">${headline}</div>
              <div class="stream-layer-strip"><span>${state.street}</span><span>${state.pot}</span></div>
            </div>
          </div>
        `;
      }
      return `
        <div class="gameplay-stream-layer ${camera.activeShot.key === "reveal" ? "align-right" : "align-center"}">
          <div class="stream-layer-shell">
            <div class="stream-layer-kicker"><span>${preset.label}</span><b>${camera.activeShot.label}</b></div>
            <div class="stream-layer-headline">${headline}</div>
            <div class="stream-cinematic-zone">
              <div class="stream-card-stage poker">
                <div class="stream-card-row board-row">${boardCards}</div>
                <div class="stream-card-row">${heroCards}</div>
              </div>
              <div class="stream-layer-strip poker"><span>${state.heroNote}</span><span>${state.pot}</span><span>${state.action}</span></div>
            </div>
            ${revealMicrostateMarkup(card, state, camera)}
          </div>
        </div>
      `;
    }

    function streamOverlayMarkup(card, state, camera) {
      const intro = roomIntro(card);
      if (intro) return roomIntroStreamOverlay(card, camera, intro);
      return "";
    }

    function gameChipMarkup(items) {
      return `
        <div class="game-chip-row">
          ${items.map((entry) => {
            const item = typeof entry === "string" ? { label: entry } : entry;
            return `<button class="game-chip ${item.active ? "active" : ""}" type="button" ${dataAttrs(item.dataset)} data-tap-feedback>${item.iconName ? icon(item.iconName) : ""}${item.label}</button>`;
          }).join("")}
        </div>
      `;
    }

    function resolvedRouletteState(card, state, memory) {
      const resolved = cloneDeep(state);
      const labels = rouletteSelectionLabels(memory);
      const totalStake = rouletteStake(memory);
      const wallet = bankrollBase(card);
      resolved.selectedNumbers = [...memory.selectedNumbers];
      resolved.selectedOutside = [...memory.selectedOutside];
      resolved.selectedSpecial = [...(memory.selectedSpecial || [])];
      resolved.betChip = memory.betChip;
      resolved.selectionText = labels.join(", ");
      if (!labels.length) {
        resolved.tone = "live";
        resolved.title = state.name === "Betting" ? "No bet locked" : `Spin ${state.resultNumber ?? ""} observed`;
        resolved.text = state.name === "Betting"
          ? "Tap a quick pick or repeat the last map."
          : "No active chip map on this spin.";
        resolved.badge = state.name === "Betting" ? "Waiting" : "No action";
        resolved.stats = [
          { label: "Stake", value: money(0) },
          { label: "Potential", value: money(0) },
          { label: "Wallet", value: money(wallet) }
        ];
        resolved.history = [
          { text: "No bet map", tone: "live" },
          { text: `${money(memory.betChip)} chip ready`, tone: "live" },
          { text: "Repeat last available", tone: "live" }
        ];
        return resolved;
      }
      if (state.name === "Betting") {
        resolved.tone = "live";
        resolved.title = "Bet accepted";
        resolved.text = `${money(totalStake)} placed on ${labels.join(", ")}.`;
        resolved.badge = "Bets open";
        resolved.stats = [
          { label: "Stake", value: money(totalStake) },
          { label: "Potential", value: `+${money(roulettePotential(memory))}` },
          { label: "Wallet", value: money(wallet) }
        ];
        resolved.history = [
          { text: `${money(memory.betChip)} per spot`, tone: "live" },
          { text: labels.join(" · "), tone: "live" },
          { text: "Timer running", tone: "live" }
        ];
        return resolved;
      }
      const payout = roulettePayout(memory, state);
      const hit = payout > 0;
      resolved.tone = hit ? "win" : "loss";
      resolved.title = hit ? `${state.resultNumber} lands on your map` : `${state.resultNumber} misses the map`;
      resolved.text = hit
        ? `Round settled. ${money(totalStake)} returns ${money(payout)}.`
        : `Round settled. ${labels.join(", ")} misses and ${money(totalStake)} is lost.`;
      resolved.badge = hit ? `Win +${money(payout)}` : `Loss -${money(totalStake)}`;
      resolved.stats = [
        { label: "Stake", value: money(totalStake) },
        { label: hit ? "Payout" : "Outcome", value: `${hit ? "+" : "-"}${money(hit ? payout : totalStake)}`, tone: hit ? "win" : "loss" },
        { label: "Wallet", value: money(wallet + (hit ? payout : -totalStake)) }
      ];
      resolved.history = hit
        ? [
            { text: labels.join(" · "), tone: "live" },
            { text: `${state.resultNumber} ${state.resultOutside?.join(" ") || ""}`.trim(), tone: "win" },
            { text: `Paid +${money(payout)}`, tone: "win" }
          ]
        : [
            { text: labels.join(" · "), tone: "live" },
            { text: `${state.resultNumber} settles`, tone: "loss" },
            { text: `Lost ${money(totalStake)}`, tone: "loss" }
          ];
      return resolved;
    }

    function resolvedBlackjackState(card, state, memory) {
      const resolved = cloneDeep(state);
      const wallet = bankrollBase(card);
      const stake = memory.stake;
      const hitCard = state.name === "Win"
        ? { rank: "6", suit: "♠" }
        : { rank: "8", suit: "♠" };
      resolved.action = memory.action;
      if (state.name === "Betting") {
        resolved.tone = "live";
        resolved.title = "Bet accepted";
        resolved.text = `${money(stake)} main bet confirmed. ${memory.action} is queued.`;
        resolved.badge = "Action on you";
        resolved.stats = [
          { label: "Stake", value: money(stake) },
          { label: "Potential", value: `+${money(stake)}` },
          { label: "Wallet", value: money(wallet) }
        ];
        resolved.history = [
          { text: "Seat locked", tone: "live" },
          { text: `${money(stake)} main bet`, tone: "live" },
          { text: `${memory.action} preselected`, tone: "live" }
        ];
        resolved.playerNote = `You: 15 · ${memory.action}`;
        return resolved;
      }
      if (memory.action === "Hit") {
        resolved.playerHand = [...resolved.playerHand, hitCard];
        resolved.playerNote = state.name === "Win" ? "You: 21 · Hit" : "You: 23 · Bust";
      } else {
        resolved.playerNote = `You: 15 · ${memory.action}`;
      }
      const win = state.name === "Win";
      resolved.tone = win ? "win" : "loss";
      resolved.title = win
        ? (memory.action === "Hit" ? "Hit lands on 21" : "Stand holds")
        : (memory.action === "Hit" ? "Hit turns to 23" : "Dealer 20 wins");
      resolved.text = win
        ? `${memory.action} closes the seat. Win +${money(stake)} settled.`
        : `${memory.action} settles the hand. Loss -${money(stake)}.`;
      resolved.badge = `${win ? "Win +" : "Loss -"}${money(stake)}`;
      resolved.stats = [
        { label: "Stake", value: money(stake) },
        { label: win ? "Payout" : "Outcome", value: `${win ? "+" : "-"}${money(stake)}`, tone: win ? "win" : "loss" },
        { label: "Wallet", value: money(wallet + (win ? stake : -stake)) }
      ];
      resolved.history = win
        ? [
            { text: `${money(stake)} main bet`, tone: "live" },
            { text: `${memory.action} holds`, tone: "live" },
            { text: `Paid +${money(stake)}`, tone: "win" }
          ]
        : [
            { text: `${money(stake)} main bet`, tone: "live" },
            { text: `${memory.action} closes`, tone: "loss" },
            { text: `Lost ${money(stake)}`, tone: "loss" }
          ];
      return resolved;
    }

    function resolvedBaccaratState(card, state, memory) {
      const resolved = cloneDeep(state);
      const wallet = bankrollBase(card);
      const side = memory.selectedBet;
      const sideLabel = side.charAt(0).toUpperCase() + side.slice(1);
      const payout = Math.round(memory.stake * baccaratPayouts[side] * 100) / 100;
      resolved.selectedBet = side;
      resolved.stake = memory.stake;
      if (state.name === "Betting") {
        resolved.tone = "live";
        resolved.title = `${sideLabel} bet confirmed`;
        resolved.text = `${money(memory.stake)} on ${sideLabel} accepted. Deal starts in 9s.`;
        resolved.badge = "Deal in 9s";
        resolved.stats = [
          { label: "Stake", value: money(memory.stake) },
          { label: "Potential", value: `+${money(payout)}` },
          { label: "Wallet", value: money(wallet) }
        ];
        resolved.history = [
          { text: `${money(memory.stake)} ${sideLabel}`, tone: "live" },
          { text: "Roadmap open", tone: "live" },
          { text: "Shoe live", tone: "live" }
        ];
        return resolved;
      }
      const outcome = state.recentRoad || "banker";
      const outcomeLabel = outcome.charAt(0).toUpperCase() + outcome.slice(1);
      const win = outcome === side;
      const settledPayout = Math.round(memory.stake * baccaratPayouts[outcome] * 100) / 100;
      resolved.tone = win ? "win" : "loss";
      resolved.title = win ? `${sideLabel} lands` : `${outcomeLabel} takes the shoe`;
      resolved.text = win
        ? `Road updates. ${sideLabel} returns ${money(settledPayout)}.`
        : `${sideLabel} misses. Loss -${money(memory.stake)}.`;
      resolved.badge = `${win ? "Win +" : "Loss -"}${money(win ? settledPayout : memory.stake)}`;
      resolved.stats = [
        { label: "Stake", value: money(memory.stake) },
        { label: win ? "Payout" : "Outcome", value: `${win ? "+" : "-"}${money(win ? settledPayout : memory.stake)}`, tone: win ? "win" : "loss" },
        { label: "Wallet", value: money(wallet + (win ? settledPayout : -memory.stake)) }
      ];
      resolved.history = win
        ? [
            { text: `${sideLabel} ${resolved.scores[side]}`, tone: "win" },
            { text: `${outcomeLabel} settles`, tone: "live" },
            { text: `Paid +${money(settledPayout)}`, tone: "win" }
          ]
        : [
            { text: `${sideLabel} ${resolved.scores[side] || "-"}`, tone: "live" },
            { text: `${outcomeLabel} ${resolved.scores[outcome] || "-"}`, tone: "loss" },
            { text: `Lost ${money(memory.stake)}`, tone: "loss" }
          ];
      return resolved;
    }

    function resolvedPokerState(card, state, memory) {
      const resolved = cloneDeep(state);
      const wallet = bankrollBase(card);
      const stake = memory.stake;
      const action = memory.action;
      const winPayout = action === "Raise" ? Math.round(stake * 3.6) : action === "Call" ? Math.round(stake * 2.2) : Math.round(stake * 1.3);
      const lossAmount = action === "Raise" ? Math.round(stake * 1.4) : action === "Call" ? stake : Math.round(stake * .4);
      resolved.action = action;
      if (state.name === "Betting") {
        resolved.tone = "live";
        resolved.title = `${action} queued`;
        resolved.text = `${money(stake)} ${action.toLowerCase()} sits on the button before the flop opens.`;
        resolved.badge = "Action on you";
        resolved.stats = [
          { label: "Stake", value: money(stake) },
          { label: "Pot", value: money(Math.round(stake * 2.8)) },
          { label: "Wallet", value: money(wallet) }
        ];
        resolved.heroNote = `Hero · Button · ${action}`;
        resolved.pot = money(Math.round(stake * 2.8));
        resolved.history = [
          { text: "Button seat", tone: "live" },
          { text: `${action} queued`, tone: "live" },
          { text: "Flop pending", tone: "live" }
        ];
        return resolved;
      }
      const win = state.name === "Win";
      resolved.tone = win ? "win" : "loss";
      resolved.title = win ? `${action} wins the pot` : `${action} loses the hand`;
      resolved.text = win
        ? `${action} carries through the showdown and ships ${money(winPayout)}.`
        : `${action} settles against the board and drops ${money(lossAmount)}.`;
      resolved.badge = `${win ? "Win +" : "Loss -"}${money(win ? winPayout : lossAmount)}`;
      resolved.stats = [
        { label: "Stake", value: money(stake) },
        { label: win ? "Payout" : "Outcome", value: `${win ? "+" : "-"}${money(win ? winPayout : lossAmount)}`, tone: win ? "win" : "loss" },
        { label: "Wallet", value: money(wallet + (win ? winPayout : -lossAmount)) }
      ];
      resolved.heroNote = `${resolved.heroNote} · ${action}`;
      resolved.pot = money(win ? winPayout : Math.round(stake * 2.2));
      resolved.history = win
        ? [
            { text: `${action} carried`, tone: "live" },
            { text: "Board holds", tone: "win" },
            { text: `Paid +${money(winPayout)}`, tone: "win" }
          ]
        : [
            { text: `${action} carried`, tone: "live" },
            { text: "Villain improves", tone: "loss" },
            { text: `Lost ${money(lossAmount)}`, tone: "loss" }
          ];
      return resolved;
    }

    function gameplayState(card) {
      const state = cloneDeep(demoState(card));
      const memory = gameplayMemory(card);
      if (card.game === "Blackjack") return resolvedBlackjackState(card, state, memory);
      if (card.game === "Poker") return resolvedPokerState(card, state, memory);
      if (card.game === "Baccarat") return resolvedBaccaratState(card, state, memory);
      return resolvedRouletteState(card, state, memory);
    }

    function gameplayStageLayout(card, state, coreMarkup, menuMarkup = "", overlayMarkup = "") {
      const phaseIndex = demoStateIndex(card);
      const phases = roundPhases(card);
      const menuOpen = isGameplayMenuOpen(card);
      const chatOpen = isGameplayChatOpen(card);
      const camera = cameraDirector(card, state);
      const entry = gameplayEntry(card);
      const cut = activeCameraCut(card);
      const gameClass = `game-${card.game.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const phaseClass = `phase-${state.name.toLowerCase()}`;
      return `
        <div class="gameplay-stage motion-live state-${state.tone} ${phaseClass} ${gameClass} ${card.providerCapture ? "provider-capture" : ""} motion-${card.id} ${camera.className} ${entry ? `entry-active entry-from-${entry.source}` : ""} ${cut ? "camera-cutting" : ""}" style="${stageMotionStyle(card)}">
          <div class="gameplay-stage-media" style="${camera.mediaStyle}">${gameplayVideoMarkup(card, camera)}${card.providerCapture ? providerCaptureMatteMarkup("gameplay") : ""}</div>
          <div class="gameplay-stage-focus" style="${camera.focusStyle}"></div>
          ${tableOverlayMarkup(card, state, camera)}
          ${streamOverlayMarkup(card, state, camera)}
          ${cut ? `<div class="gameplay-cut-flash"></div>` : ""}
          <div class="gameplay-stage-top">
            <div class="gameplay-stage-pill-row">
              <div class="gameplay-stage-meta">
                <span class="session-meta-pill">${icon("watch")}Live</span>
                <span class="session-meta-pill">${card.table}</span>
              </div>
              <div class="gameplay-stage-actions">
                ${closeButton()}
              </div>
            </div>
          </div>
          ${overlayMarkup}
          <div class="gameplay-stage-bottom">
            ${coreMarkup}
          </div>
          ${menuOpen ? menuMarkup : ""}
        </div>
      `;
    }

    function liveControlsMarkup(card) {
      const live = isLiveRound(card);
      const phaseIndex = demoStateIndex(card);
      const phases = roundPhases(card);
      return `
        <div class="session-toolbar">
          <div class="session-toolbar-main">
            <button class="session-chip ${live ? "active" : "primary"}" type="button" data-live-toggle data-tap-feedback>${live ? "Auto round on" : "Start auto round"}</button>
            <span class="session-meta-pill">${icon("watch")}${sessionModeLabel(card)} · ${live ? "live" : "manual"}</span>
          </div>
          <button class="session-chip subtle" type="button" data-live-reset data-tap-feedback>Reset</button>
        </div>
        <div class="phase-rail">
          ${phases.map((phase, index) => `
            <button class="phase-pill ${index === phaseIndex ? "active" : ""}" type="button" data-demo-state="${index}" data-tap-feedback>
              <strong>${phase.title}</strong>
              <span>${phase.text}</span>
            </button>
          `).join("")}
        </div>
        <div class="session-meta">
          <span class="session-meta-pill">${icon("trend")}Phase preview</span>
          <button class="session-text-link" type="button" data-live-step data-tap-feedback>${live ? "Skip phase" : "Next phase"}</button>
        </div>
      `;
    }

    function commitGameplayMemory(card) {
      liveRoundByCard[card.id] = false;
      demoStateByCard[card.id] = 0;
      syncCameraState(card, currentSheetType === "gameplay");
      refreshSheet();
    }

    function refreshSheet() {
      if (currentSheetType) {
        sheetPanel.innerHTML = sheetMarkup(currentSheetType);
        syncStreamPlayback();
      }
    }

    function advanceLiveRound(card = item()) {
      const states = demoStates(card);
      if (!states.length) return;
      demoStateByCard[card.id] = (demoStateIndex(card) + 1) % states.length;
      syncCameraState(card, currentSheetType === "gameplay");
      refreshSheet();
    }

    function startLiveRoundTimer() {
      window.clearTimeout(liveRoundTimer);
      if (!currentSheetType || !["watch", "gameplay"].includes(currentSheetType)) return;
      const card = item();
      if (!isLiveRound(card)) return;
      liveRoundTimer = window.setTimeout(() => {
        if (!currentSheetType || !["watch", "gameplay"].includes(currentSheetType)) return;
        const currentCard = item();
        if (!isLiveRound(currentCard)) return;
        advanceLiveRound(currentCard);
        startLiveRoundTimer();
      }, liveRoundDelay(card));
    }

    function historyMarkup(state) {
      return `
        <div class="history-row">
          ${(state.history || []).map((entry) => `<span class="history-pill ${entry.tone || ""}">${entry.text}</span>`).join("")}
        </div>
      `;
    }

    function statsMarkup(state) {
      return `
        <div class="summary-strip">
          ${(state.stats || []).map((entry) => `<div class="summary-box ${entry.tone || ""}"><strong>${entry.value}</strong><span>${entry.label}</span></div>`).join("")}
        </div>
      `;
    }

    function renderRouletteGameplay(card) {
      const state = gameplayState(card);
      const memory = gameplayMemory(card);
      const camera = cameraDirector(card, state);
      const track = (state.trackTail || card.rouletteTrack || []).map((value, index) => `<span class="roulette-pill ${(state.trackColors || card.rouletteColors || [])[index] || ""} ${String(state.resultNumber ?? "") === String(value) ? "result" : ""}">${value}</span>`).join("");
      const selectedCount = rouletteSelectedCount(memory);
      const selectedMarkup = selectedCount
        ? rouletteSelectionStripMarkup(memory, { max: 8 })
        : '<div class="gameplay-stream-note">No map selected yet.</div>';
      const selectedHudMarkup = selectedCount
        ? rouletteSelectionStripMarkup(memory, { compact: true, max: 4, liveFirst: true })
        : '<div class="dealer-call"><strong>No map</strong></div>';
      const quickPickMarkup = gameChipMarkup([
        { label: "12", active: memory.selectedNumbers.includes(12), dataset: { "roulette-bet": "number:12" } },
        { label: "0", active: memory.selectedNumbers.includes(0), dataset: { "roulette-bet": "number:0" } },
        { label: "Red", active: memory.selectedOutside.includes("red"), dataset: { "roulette-bet": "outside:red" } },
        { label: "Voisins", active: rouletteNumberGroupActive(memory, rouletteSectorCalls[0].numbers), dataset: { "roulette-numbers": rouletteSectorCalls[0].numbers.join(",") } },
        { label: "1-3", active: (memory.selectedSpecial || []).includes("street:1-2-3"), dataset: { "roulette-bet": "special:street:1-2-3" } },
        { label: "1-5", active: (memory.selectedSpecial || []).includes("corner:1-2-4-5"), dataset: { "roulette-bet": "special:corner:1-2-4-5" } },
        { label: "Repeat", dataset: { "roulette-repeat": "1" } }
      ]);
      const menuMarkup = `
        <div class="gameplay-menu-drawer">
          <div class="gameplay-menu-header">
            <div><strong>Table menu</strong><span>Recent track, round data and reset</span></div>
          </div>
          ${liveControlsMarkup(card)}
          <div class="gameplay-menu-section">
            <strong>Camera logic</strong>
            <div class="gameplay-camera-strip">
              ${camera.shots.map((shot, index) => `<span class="gameplay-camera-chip ${index === camera.activeIndex ? "active" : ""}">${shot.label}</span>`).join("")}
            </div>
            <div class="gameplay-stream-note">${camera.activeShot.note}</div>
          </div>
          <div class="gameplay-menu-section">
            <strong>Selected bets</strong>
            ${selectedMarkup}
            ${quickPickMarkup}
          </div>
          <div class="gameplay-menu-section">
            <strong>Recent track</strong>
            <div class="roulette-track">${track}</div>
          </div>
          <div class="gameplay-menu-section">
            <strong>Round data</strong>
            ${historyMarkup(state)}
            ${statsMarkup(state)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Windows</strong>
            ${gameChipMarkup([
              { iconName: "stats", label: "Stats", dataset: { sheet: "stats" } },
              { iconName: "info", label: "Info", dataset: { sheet: "info" } },
              { iconName: "tip", label: "Tip", dataset: { sheet: "tips" } },
              { iconName: "wallet", label: "Account", dataset: { sheet: "account" } }
            ])}
          </div>
          <div class="gameplay-menu-actions">
            <button class="gameplay-control-chip" type="button" data-live-reset data-tap-feedback>Reset round</button>
            <button class="gameplay-control-chip" type="button" data-sheet="watch" data-tap-feedback>Back to feed</button>
          </div>
        </div>
      `;
      const coreMarkup = `
          <div class="gameplay-core-card gameplay-overlay-hud compact">
            <div class="gameplay-seat-line">
              <span>${selectedCount ? `${selectedCount} spots live` : "Map open"}</span>
              <span>${money(rouletteStake(memory))} stake</span>
            </div>
            <div class="gameplay-wheel-row">
              <div class="gameplay-compact-bets">${selectedHudMarkup}</div>
              <div class="wheel-mini ${state.tone} ${state.resultNumber !== null ? "resulting" : ""}" data-tap-feedback><span>${state.resultNumber ?? "?"}</span></div>
            </div>
            <div class="gameplay-action-tray">
              ${betChipRailMarkup([5, 10, 25, 100], memory.betChip)}
            </div>
        </div>
      `;
      return gameplayStageLayout(card, state, coreMarkup, menuMarkup);
    }

    function renderBlackjackGameplay(card) {
      const state = gameplayState(card);
      const memory = gameplayMemory(card);
      const camera = cameraDirector(card, state);
      const dealerMeta = (state.dealerNote || "Dealer").replace("Dealer: ", "");
      const playerMeta = (state.playerNote || "You").replace("You: ", "");
      const dealerCards = (state.dealerHand || []).map((entry, index) => {
        const classes = ["playing-card", "dealer-card"];
        if (entry.back) {
          classes.push("back", "waiting");
        } else if (state.name !== "Betting") {
          if (index === 1) classes.push("reveal");
          if (index >= 2) classes.push("drawn");
        }
        if (!entry.back) classes.push(suitToneClass(entry));
        return `<div class="${classes.join(" ")}" data-tap-feedback>${entry.back ? "?" : `${entry.rank}<small>${entry.suit}</small>`}</div>`;
      }).join("");
      const playerCards = (state.playerHand || []).map((entry) => `<div class="playing-card player-card ${suitToneClass(entry)}" data-tap-feedback>${entry.rank}<small>${entry.suit}</small></div>`).join("");
      const menuMarkup = `
        <div class="gameplay-menu-drawer">
          <div class="gameplay-menu-header">
            <div><strong>Hand menu</strong><span>Extra actions, round data and reset</span></div>
          </div>
          ${liveControlsMarkup(card)}
          <div class="gameplay-menu-section">
            <strong>Camera logic</strong>
            <div class="gameplay-camera-strip">
              ${camera.shots.map((shot, index) => `<span class="gameplay-camera-chip ${index === camera.activeIndex ? "active" : ""}">${shot.label}</span>`).join("")}
            </div>
            <div class="gameplay-stream-note">${camera.activeShot.note}</div>
          </div>
          <div class="gameplay-menu-section">
            <strong>Extra actions</strong>
            ${gameChipMarkup(["Double", "Split", "Insurance", "Side bet"])}
          </div>
          <div class="gameplay-menu-section">
            <strong>Seat memory</strong>
            ${gameChipMarkup([
              { label: "Hit", active: memory.action === "Hit", dataset: { "blackjack-action": "Hit" } },
              { label: "Stand", active: memory.action === "Stand", dataset: { "blackjack-action": "Stand" } }
            ])}
            ${betChipRailMarkup([25, 50, 75, 100], memory.stake)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Round data</strong>
            ${historyMarkup(state)}
            ${statsMarkup(state)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Windows</strong>
            ${gameChipMarkup([
              { iconName: "stats", label: "Stats", dataset: { sheet: "stats" } },
              { iconName: "info", label: "Info", dataset: { sheet: "info" } },
              { iconName: "tip", label: "Tip", dataset: { sheet: "tips" } },
              { iconName: "wallet", label: "Account", dataset: { sheet: "account" } }
            ])}
          </div>
          <div class="gameplay-menu-actions">
            <button class="gameplay-control-chip" type="button" data-live-reset data-tap-feedback>Reset hand</button>
            <button class="gameplay-control-chip" type="button" data-sheet="watch" data-tap-feedback>Back to feed</button>
          </div>
        </div>
      `;
      const bettingPhase = state.name === "Betting";
      const seatValue = bettingPhase ? `${money(memory.stake)} live` : state.badge;
      const coreMarkup = `
        <div class="gameplay-core-card gameplay-overlay-hud compact blackjack-hud shot-${camera.activeShot.key} state-${state.name.toLowerCase()}">
          <div class="gameplay-seat-line">
            <span>Seat 1</span>
            <span>${seatValue}</span>
          </div>
          <div class="gameplay-overlay-hands">
            <div class="gameplay-hand-block dealer-block">
              <div class="hand-meta"><b>Dealer</b><span>${dealerMeta}</span></div>
              <div class="playing-hand dealer-hand">${dealerCards}</div>
            </div>
            <div class="gameplay-hand-block player-block">
              <div class="hand-meta"><b>You</b><span>${playerMeta}</span></div>
              <div class="playing-hand player-hand">${playerCards}</div>
            </div>
          </div>
          ${bettingPhase ? `<div class="decision-row">
            <button class="decision-pill ${memory.action === "Hit" ? "active locked" : ""}" type="button" data-blackjack-action="Hit" data-tap-feedback>Hit</button>
            <button class="decision-pill ${memory.action === "Stand" ? "active locked" : ""}" type="button" data-blackjack-action="Stand" data-tap-feedback>Stand</button>
          </div>` : ""}
          ${bettingPhase ? `<div class="gameplay-action-tray">${betChipRailMarkup([25, 50, 75, 100], memory.stake)}</div>` : ""}
        </div>
      `;
      return gameplayStageLayout(card, state, coreMarkup, menuMarkup);
    }

    function renderBaccaratGameplay(card) {
      const state = gameplayState(card);
      const memory = gameplayMemory(card);
      const camera = cameraDirector(card, state);
      const road = [...(card.baccaratRoad || []), ...(state.recentRoad ? [state.recentRoad] : [])]
        .slice(-12)
        .map((entry, index, array) => `<div class="road-dot ${entry} ${index === array.length - 1 && state.recentRoad ? "recent" : ""}" data-tap-feedback></div>`)
        .join("");
      const menuMarkup = `
        <div class="gameplay-menu-drawer">
          <div class="gameplay-menu-header">
            <div><strong>Shoe menu</strong><span>Road detail, round data and reset</span></div>
          </div>
          ${liveControlsMarkup(card)}
          <div class="gameplay-menu-section">
            <strong>Camera logic</strong>
            <div class="gameplay-camera-strip">
              ${camera.shots.map((shot, index) => `<span class="gameplay-camera-chip ${index === camera.activeIndex ? "active" : ""}">${shot.label}</span>`).join("")}
            </div>
            <div class="gameplay-stream-note">${camera.activeShot.note}</div>
          </div>
          <div class="gameplay-menu-section">
            <strong>Round data</strong>
            ${historyMarkup(state)}
            ${statsMarkup(state)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Shoe memory</strong>
            ${gameChipMarkup([
              { label: "Player", active: memory.selectedBet === "player", dataset: { "baccarat-side": "player" } },
              { label: "Banker", active: memory.selectedBet === "banker", dataset: { "baccarat-side": "banker" } },
              { label: "Tie", active: memory.selectedBet === "tie", dataset: { "baccarat-side": "tie" } }
            ])}
            ${betChipRailMarkup([25, 100, 250], memory.stake)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Road map</strong>
            <div class="road-grid ${state.recentRoad ? "settle" : ""}">${road}</div>
          </div>
          <div class="gameplay-menu-section">
            <strong>Windows</strong>
            ${gameChipMarkup([
              { iconName: "stats", label: "Stats", dataset: { sheet: "stats" } },
              { iconName: "info", label: "Info", dataset: { sheet: "info" } },
              { iconName: "tip", label: "Tip", dataset: { sheet: "tips" } },
              { iconName: "wallet", label: "Account", dataset: { sheet: "account" } }
            ])}
          </div>
          <div class="gameplay-menu-actions">
            <button class="gameplay-control-chip" type="button" data-live-reset data-tap-feedback>Reset shoe</button>
            <button class="gameplay-control-chip" type="button" data-sheet="watch" data-tap-feedback>Back to feed</button>
          </div>
        </div>
      `;
      const coreMarkup = `
        <div class="gameplay-core-card gameplay-overlay-hud slim">
          <div class="gameplay-seat-line">
            <span>${memory.selectedBet ? memory.selectedBet.charAt(0).toUpperCase() + memory.selectedBet.slice(1) : "Side open"}</span>
            <span>${money(memory.stake)} live</span>
          </div>
          <div class="gameplay-baccarat-inline">
            <div class="baccarat-scores">
              <button class="baccarat-score player ${state.selectedBet === "player" || state.recentRoad === "player" ? "active" : ""}" type="button" data-baccarat-side="player" data-tap-feedback><strong>P</strong><small>${state.scores.player}</small></button>
              <button class="baccarat-score tie ${state.selectedBet === "tie" || state.recentRoad === "tie" ? "active" : ""}" type="button" data-baccarat-side="tie" data-tap-feedback><strong>T</strong><small>${state.scores.tie}</small></button>
              <button class="baccarat-score banker ${state.selectedBet === "banker" || state.recentRoad === "banker" ? "active" : ""}" type="button" data-baccarat-side="banker" data-tap-feedback><strong>B</strong><small>${state.scores.banker}</small></button>
            </div>
            <div class="gameplay-road-inline"><div class="road-grid ${state.recentRoad ? "settle" : ""}">${road}</div></div>
          </div>
          <div class="gameplay-action-tray">
            ${betChipRailMarkup([25, 100, 250], memory.stake)}
          </div>
        </div>
      `;
      return gameplayStageLayout(card, state, coreMarkup, menuMarkup);
    }

    function renderPokerGameplay(card) {
      const state = gameplayState(card);
      const memory = gameplayMemory(card);
      const camera = cameraDirector(card, state);
      const heroToneClass = state.tone === "win" ? "poker-live" : state.tone === "loss" ? "poker-dim" : "";
      const villainToneClass = state.tone === "loss" ? "poker-live" : state.tone === "win" ? "poker-dim" : "";
      const heroCards = (state.heroHand || []).map((entry) => `<div class="playing-card player-card ${suitToneClass(entry)}" data-tap-feedback>${entry.rank}<small>${entry.suit}</small></div>`).join("");
      const villainCards = (state.villainHand || []).map((entry, index) => {
        const classes = ["playing-card", "dealer-card"];
        if (entry.back) classes.push("back", "waiting");
        else {
          classes.push(suitToneClass(entry));
          if (state.name !== "Betting") classes.push(index === 1 ? "reveal" : "drawn");
        }
        return `<div class="${classes.join(" ")}" data-tap-feedback>${entry.back ? "?" : `${entry.rank}<small>${entry.suit}</small>`}</div>`;
      }).join("");
      const boardCards = (state.board || []).map((entry, index) => {
        const classes = ["playing-card"];
        if (entry.back) classes.push("back");
        else {
          classes.push(suitToneClass(entry));
          if (state.name !== "Betting") classes.push(index >= 3 ? "reveal" : "drawn");
        }
        return `<div class="${classes.join(" ")}" data-tap-feedback>${entry.back ? "?" : `${entry.rank}<small>${entry.suit}</small>`}</div>`;
      }).join("");
      const menuMarkup = `
        <div class="gameplay-menu-drawer">
          <div class="gameplay-menu-header">
            <div><strong>Hand menu</strong><span>Action memory, round data and reset</span></div>
          </div>
          ${liveControlsMarkup(card)}
          <div class="gameplay-menu-section">
            <strong>Camera logic</strong>
            <div class="gameplay-camera-strip">
              ${camera.shots.map((shot, index) => `<span class="gameplay-camera-chip ${index === camera.activeIndex ? "active" : ""}">${shot.label}</span>`).join("")}
            </div>
            <div class="gameplay-stream-note">${camera.activeShot.note}</div>
          </div>
          <div class="gameplay-menu-section">
            <strong>Action memory</strong>
            ${gameChipMarkup([
              { label: "Check", active: memory.action === "Check", dataset: { "poker-action": "Check" } },
              { label: "Call", active: memory.action === "Call", dataset: { "poker-action": "Call" } },
              { label: "Raise", active: memory.action === "Raise", dataset: { "poker-action": "Raise" } }
            ])}
            ${betChipRailMarkup([25, 50, 100, 250], memory.stake)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Round data</strong>
            ${historyMarkup(state)}
            ${statsMarkup(state)}
          </div>
          <div class="gameplay-menu-section">
            <strong>Windows</strong>
            ${gameChipMarkup([
              { iconName: "stats", label: "Stats", dataset: { sheet: "stats" } },
              { iconName: "info", label: "Info", dataset: { sheet: "info" } },
              { iconName: "tip", label: "Tip", dataset: { sheet: "tips" } },
              { iconName: "wallet", label: "Account", dataset: { sheet: "account" } }
            ])}
          </div>
          <div class="gameplay-menu-actions">
            <button class="gameplay-control-chip" type="button" data-live-reset data-tap-feedback>Reset hand</button>
            <button class="gameplay-control-chip" type="button" data-sheet="watch" data-tap-feedback>Back to feed</button>
          </div>
        </div>
      `;
      const coreMarkup = `
        <div class="gameplay-core-card gameplay-overlay-hud compact">
          <div class="gameplay-seat-line">
            <span>${state.heroNote}</span>
            <span>${money(memory.stake)} live</span>
          </div>
          <div class="gameplay-poker-inline">
            <div class="poker-pot-row">
              <div class="poker-pot-pill live"><strong>${state.street}</strong><small>street</small></div>
              <div class="poker-pot-pill pot"><strong>${state.pot}</strong><small>pot</small></div>
              <div class="poker-pot-pill action"><strong>${state.action}</strong><small>action</small></div>
            </div>
            <div class="gameplay-hand-block board-focus">
              <div class="hand-meta"><b>Board</b><span>${state.street}</span></div>
              <div class="playing-hand poker-board-row">${boardCards}</div>
            </div>
            <div class="gameplay-overlay-hands">
              <div class="gameplay-hand-block villain-hand ${villainToneClass}">
                <div class="hand-meta"><b>Villain</b><span>${state.villainNote}</span></div>
                <div class="playing-hand dealer-hand">${villainCards}</div>
              </div>
              <div class="gameplay-hand-block hero-hand ${heroToneClass}">
                <div class="hand-meta"><b>You</b><span>${state.heroNote}</span></div>
                <div class="playing-hand player-hand">${heroCards}</div>
              </div>
            </div>
          </div>
          <div class="decision-row poker">
            <button class="decision-pill check ${memory.action === "Check" ? "active locked" : ""}" type="button" data-poker-action="Check" data-tap-feedback>Check</button>
            <button class="decision-pill call ${memory.action === "Call" ? "active locked" : ""}" type="button" data-poker-action="Call" data-tap-feedback>Call</button>
            <button class="decision-pill raise ${memory.action === "Raise" ? "active locked" : ""}" type="button" data-poker-action="Raise" data-tap-feedback>Raise</button>
          </div>
          <div class="gameplay-action-tray">
            ${betChipRailMarkup([25, 50, 100, 250], memory.stake)}
          </div>
        </div>
      `;
      return gameplayStageLayout(card, state, coreMarkup, menuMarkup);
    }

    function gameplayMarkup(card) {
      if (card.game === "Blackjack") return renderBlackjackGameplay(card);
      if (card.game === "Poker") return renderPokerGameplay(card);
      if (card.game === "Baccarat") return renderBaccaratGameplay(card);
      return renderRouletteGameplay(card);
    }

    function render() {
      if (window.LC_APP_MODE === "public_demo" && window.location.hash.startsWith("#/product")) return;
      const storyMarkup = cards.map((card, index) => `
        <button class="story ${index === active ? "active" : ""}" type="button" data-index="${index}" aria-label="${card.dealer}">
          <span class="avatar-ring"><img src="${card.image}" alt="${card.dealer} dealer avatar" /></span>
          <span>${card.dealer}</span>
        </button>
      `).join("");
      stories.innerHTML = storyMarkup;
      if (homeStories) homeStories.innerHTML = storyMarkup;

      progress.innerHTML = cards.map((_, index) => `<i class="${index === active ? "active" : ""}"></i>`).join("");

      feed.innerHTML = cards.map((card, index) => `
        <article class="live-card feed-${card.id} ${card.feedVideo ? "has-stream" : ""} ${card.providerCapture ? "provider-capture" : ""}" data-index="${index}" style="${feedMotionStyle(card)}">
          <img src="${card.image}" alt="${card.dealer} live dealer screen" style="${feedImageStyle(card)}" />
          ${feedVideoMarkup(card)}
          ${card.providerCapture ? providerCaptureMatteMarkup("home") : ""}
          <div class="live-card-parallax"></div>
          <div class="casino-ambience"><span></span></div>
          <button class="live-badge" type="button" data-reveal-rail aria-label="Live dealers"><i></i></button>
          <div class="table-state">${icon("limit")}${card.stakes}</div>
          <div class="copy">
            <div class="copy-topline">
              <span class="pill">${icon(card.game === "Poker" ? "cards" : "play")}${card.game}</span>
              <span class="pill">${icon("trend")}${card.state}</span>
            </div>
            <h2>${card.table}</h2>
            <div class="copy-subtitle">${card.dealer} live · ${card.operator}</div>
            <p>${card.read}</p>
            <div class="copy-room-line">
              <span>${card.game}</span>
              <span>${card.language}</span>
            </div>
            <div class="entry-strip">
              ${entryChip("lang", card.language)}
              ${entryChip("seat", `${card.seat} open`)}
              ${entryChip("watch", card.watching)}
            </div>
            <div class="cta-row">
              <button class="stream-action secondary-ghost" type="button" data-sheet="watch" aria-label="Watch" data-tap-feedback>${icon("watch")}<span>Watch</span></button>
              <button class="stream-action primary" type="button" data-sheet="gameplay" aria-label="Play" data-tap-feedback>${icon("play")}<span>Play now</span></button>
            </div>
          </div>
        </article>
      `).join("");

      renderViewShell();
      syncSide();
      renderChromeState();
      syncStreamPlayback();
    }

    function syncSide() {
      const card = item();
      document.getElementById("activeTitle").textContent = card.title;
      document.getElementById("activeRead").textContent = card.read;
      document.getElementById("kpiWatch").textContent = card.watching;
      document.getElementById("kpiJoin").textContent = card.join;
      document.getElementById("kpiArpu").textContent = card.arpu;
      [stories, homeStories].forEach((container) => {
        if (!container) return;
        container.querySelectorAll(".story").forEach((story, index) => story.classList.toggle("active", index === active));
      });
      progress.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("active", index === active));
      renderViewShell();
      renderChromeState();
      syncStreamPlayback();
    }

    function goTo(index) {
      active = (index + cards.length) % cards.length;
      const target = feed.querySelector(`[data-index="${active}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      syncSide();
      updateSignal();
      if (currentSheetType) openSheet(currentSheetType);
    }

    function sheetMarkup(type) {
      const card = item();
      const gameIconLabel = gameIconName(card);
      const roomRole = dealerRoleLabel(card);
      const roomMode = roomModeLabel(card);
      const roomSignal = roomSignalLabel(card);
      const roomDraft = card.game === "Poker"
        ? `Keep me in ${card.table} if the next hand stays heads-up.`
        : card.game === "Roulette"
          ? `If the next spin opens clean at ${card.table}, save me a spot.`
          : card.game === "Blackjack"
            ? `If seat ${card.seat} stays open after this hand, hold it for me.`
            : `If the next shoe opens at ${card.table}, keep me in the room.`;
      const roomQuickAsk = card.game === "Poker"
        ? "Hold me for the next hand"
        : card.game === "Roulette"
          ? "Open seat on next spin?"
          : card.game === "Blackjack"
            ? "Seat after this hand?"
            : "Keep me for next shoe";
      if (type === "profile") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Dealer</span><h3>${card.dealer}</h3></div>
            ${closeButton()}
          </div>
          <div class="dealer-profile-hero">
            <div class="dealer-profile-backdrop" style="${profileBackdropStyle(card)}"></div>
            <div class="dealer-avatar-stack">
              <div class="dealer-avatar-preview">
                <img src="${card.image}" alt="${card.dealer} dealer portrait" style="${profileImageStyle(card)}" />
              </div>
              <span class="dealer-live-chip">${icon("lang")}${card.language}</span>
            </div>
            <div class="dealer-profile-copy">
              <span class="dealer-profile-kicker">${roomRole}</span>
              <h4>${card.dealer} leads the room</h4>
              <p>${card.caption}</p>
              <div class="dealer-profile-tags">
                <span>${card.table}</span>
                <span>${card.stakes}</span>
                <span>${card.seat} open</span>
              </div>
            </div>
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="gameplay">Play</button>
            <button class="btn secondary" type="button" data-sheet="message">Message</button>
            <button class="btn secondary" type="button" data-sheet="tips">Tip</button>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon(gameIconLabel)}${roomMode}</span>
            <span class="quick-link">${icon("watch")}${card.watching}</span>
            <span class="quick-link">${icon("trend")}${card.trend}</span>
          </div>
          <div class="list">
            ${compactListRow("play", "table", card.table)}
            ${compactListRow("lang", "language", card.language)}
            ${compactListRow("limit", "limits", card.stakes)}
            ${compactListRow("seat", "open seats", card.seat)}
            ${compactListRow("watch", "watching", card.watching)}
            ${compactListRow("trend", roomSignal.toLowerCase(), card.trend)}
          </div>
          <div class="module-grid compact-modules" aria-label="Dealer actions">
            ${moduleTile("chat", "Message", { sheet: "message" })}
            ${moduleTile("tip", "Tips", { sheet: "tips" })}
            ${moduleTile("stats", "Stats", { sheet: "stats" })}
            ${moduleTile("watch", "Watch", { sheet: "watch" })}
          </div>
        `;
      }

      if (type === "handoff") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill teal">Table entry</span><h3>${card.operator}</h3></div>
            ${closeButton()}
          </div>
          <div class="list">
            <div class="list-row"><b>Account</b><span>Linked entry</span></div>
            <div class="list-row"><b>Wallet</b><span>Player wallet</span></div>
            <div class="list-row"><b>Session</b><span>LC App handoff</span></div>
            <div class="list-row"><b>Table</b><span>${card.table}</span></div>
          </div>
          <div class="operator-status">
            <div>Table ready</div>
            <div>Wallet linked</div>
            <div>Session tagged</div>
          </div>
          <div class="operator-stack">
            <div class="operator-card"><strong>Social feed to table</strong><span>The app opens with the dealer and hands the player into table play only when they are ready.</span></div>
            <div class="operator-card"><strong>Wallet stays separate</strong><span>Account, tips and table play can stay grouped without putting those flows on the first screen.</span></div>
            <div class="operator-card"><strong>Tracking stays attached</strong><span>The handoff keeps dealer, table and session context for reporting and retention.</span></div>
          </div>
          <div class="row-grid">
            <div class="metric"><strong>${card.join}</strong><span>entry signal</span></div>
            <div class="metric"><strong>${card.stakes}</strong><span>stakes</span></div>
            <div class="metric"><strong>${card.trend}</strong><span>trend</span></div>
          </div>
          <div class="sheet-actions">
            <button class="btn" type="button" data-sheet="gameplay">Open table</button>
            <button class="btn secondary" type="button" data-sheet="account">Account</button>
          </div>
        `;
      }

      if (type === "account") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Account</span><h3>Player account</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill gold">Illustrative account</span>
              <span class="account-hub-tag">${icon("shield")}Operator-owned identity</span>
            </div>
            <div class="account-hub-balance">
              <strong>External</strong>
              <span>Wallet and gameplay account</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("wallet")}No wallet data in LC</span>
              <span class="account-hub-tag">${icon("history")}Illustrative activity</span>
              <span class="account-hub-tag">${icon(gameIconLabel)}${card.table}</span>
            </div>
          </div>
          <div class="account-balance-row">
            <div class="account-balance-card primary"><strong>Operator</strong><span>gameplay account</span></div>
            <div class="account-balance-card"><strong>External</strong><span>cashier</span></div>
            <div class="account-balance-card"><strong>Not stored</strong><span>financial data</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("wallet")}instant cashier</span>
            <span class="quick-link">${icon(gameIconLabel)}${roomMode}</span>
            <span class="quick-link">${icon("shield")}limits active</span>
          </div>
          <div class="sheet-section">
            <div class="sheet-section-head"><strong>Cashier</strong><span>core</span></div>
            <div class="module-grid compact-modules">
              ${moduleTile("wallet", "Cashier", { sheet: "wallet" })}
              ${moduleTile("history", "History", { sheet: "history" })}
              ${moduleTile("tip", "Tips", { sheet: "tips" })}
              ${moduleTile("shield", "Limits", { sheet: "compliance" })}
            </div>
          </div>
          <div class="sheet-section">
            <div class="sheet-section-head"><strong>Player loop</strong><span>social</span></div>
            <div class="module-grid compact-modules">
              ${moduleTile("watch", "Saved rooms", { sheet: "saved" })}
              ${moduleTile("chat", "Messages", { sheet: "message" })}
              ${moduleTile("watch", "Alerts", { sheet: "alerts" })}
              ${moduleTile("profile", "Roles", { sheet: "roles" })}
            </div>
          </div>
          <div class="list">
            ${compactListRow("profile", "player id", "Illustrative")}
            ${compactListRow("wallet", "wallet rails", "Licensed operator-owned")}
            ${compactListRow("history", "cashout", "Not stored by LC")}
            ${compactListRow(gameIconLabel, "active room", `${card.dealer} · ${card.table}`)}
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="wallet">Open cashier</button>
            <button class="btn secondary" type="button" data-sheet="history">History</button>
          </div>
        `;
      }

      if (type === "history") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill">History</span><h3>Player timeline</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill">Timeline</span>
              <span class="account-hub-tag">${icon("history")}126 hands</span>
            </div>
            <div class="account-hub-balance">
              <strong>External</strong>
              <span>Gameplay and financial history</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("watch")}Saved-room context</span>
              <span class="account-hub-tag">${icon("tip")}No tip result data</span>
              <span class="account-hub-tag">${icon("wallet")}No wallet data</span>
            </div>
          </div>
          <div class="summary-strip">
            <div class="summary-box"><strong>External</strong><span>hands</span></div>
            <div class="summary-box win"><strong>External</strong><span>game results</span></div>
            <div class="summary-box"><strong>Not stored</strong><span>financial result</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon(gameIconLabel)}${card.table}</span>
            <span class="quick-link">${icon("tip")}Illustrative tip flow</span>
            <span class="quick-link">${icon("wallet")}Operator-owned cashier</span>
          </div>
          <div class="history-row">
            <span class="history-pill live">live rooms</span>
            <span class="history-pill win">winning streak</span>
            <span class="history-pill">tips tracked</span>
            <span class="history-pill">return visits</span>
          </div>
          <div class="sheet-section">
            <div class="sheet-section-head"><strong>Timeline tools</strong><span>filters</span></div>
            <div class="module-grid compact-modules">
              ${moduleTile("watch", "Saved", { sheet: "saved" })}
              ${moduleTile("wallet", "Cashier", { sheet: "wallet" })}
              ${moduleTile("tip", "Tips", { sheet: "tips" })}
              ${moduleTile("chat", "Messages", { sheet: "message" })}
            </div>
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">${card.game}</span>
                <b>${card.dealer} · ${card.table}</b>
                <span class="activity-card-side">${card.stakes}</span>
              </div>
              <p>${roomSignal} tracked through the latest saved-room session.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill loss">Demo result</span>
                <b>Blackjack · Sofia</b>
                <span class="activity-card-side">Stand</span>
              </div>
              <p>Seat stayed open for return play.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill win">Demo result</span>
                <b>Baccarat · Marcus</b>
                <span class="activity-card-side">Player</span>
              </div>
              <p>Side call closed in one pass.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Demo tip</span>
                <b>${card.dealer}</b>
                <span class="activity-card-side">2h ago</span>
              </div>
              <p>Tip linked to the saved room.</p>
            </div>
          </div>
          <div class="sheet-actions flush">
            <button class="btn secondary" type="button" data-sheet="wallet">Wallet</button>
            <button class="btn" type="button" data-sheet="saved">Saved rooms</button>
          </div>
        `;
      }

      if (type === "saved") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Saved</span><h3>Saved rooms</h3></div>
            ${closeButton()}
          </div>
          <div class="summary-strip">
            <div class="summary-box"><strong>3</strong><span>saved rooms</span></div>
            <div class="summary-box"><strong>4</strong><span>preview records</span></div>
            <div class="summary-box win"><strong>Not measured</strong><span>return rate</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("watch")}${card.dealer} live</span>
            <span class="quick-link">${icon("seat")}${card.seat} open seats</span>
            <span class="quick-link">${icon(gameIconLabel)}${roomMode}</span>
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Session preview</span>
                <b>${card.dealer} · ${card.table}</b>
                <span class="activity-card-side">${card.stakes}</span>
              </div>
              <p>${roomSignal} and saved-room memory stay attached to this illustrative session.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill">Saved</span>
                <b>Sofia · Blackjack Royal</b>
                <span class="activity-card-side">$25-$1K</span>
              </div>
              <p>VIP seat quality and readable deals.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill win">Hot room</span>
                <b>Marcus · Golden Baccarat</b>
                <span class="activity-card-side">$20-$750</span>
              </div>
              <p>Road rhythm and repeat pull.</p>
            </div>
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="watch">Open preview</button>
            <button class="btn secondary" type="button" data-sheet="alerts">Room alerts</button>
          </div>
        `;
      }

      if (type === "wallet") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill teal">Wallet</span><h3>Cashier</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill teal">Operator-owned</span>
              <span class="account-hub-tag">${icon("history")}Illustrative boundary</span>
            </div>
            <div class="account-hub-balance">
              <strong>External</strong>
              <span>Licensed operator cashier</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("wallet")}No payment data in LC</span>
              <span class="account-hub-tag">${icon("wallet")}No card data in LC</span>
              <span class="account-hub-tag">${icon("shield")}withdrawal check</span>
            </div>
          </div>
          <div class="account-balance-row">
            <div class="account-balance-card primary"><strong>Not stored</strong><span>balance</span></div>
            <div class="account-balance-card"><strong>External</strong><span>cashout</span></div>
            <div class="account-balance-card"><strong>External</strong><span>tips</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("wallet")}Crypto</span>
            <span class="quick-link">${icon("wallet")}Card</span>
            <span class="quick-link">${icon(gameIconLabel)}${card.game} ready</span>
          </div>
          <div class="sheet-section">
            <div class="sheet-section-head"><strong>Cashier tools</strong><span>flow</span></div>
            <div class="module-grid compact-modules">
              ${moduleTile("wallet", "Deposit", { action: "save" }, "primary")}
              ${moduleTile("history", "Withdraw", { action: "save" })}
              ${moduleTile("wallet", "Wallets", { action: "save" })}
              ${moduleTile("shield", "Limits", { sheet: "compliance" })}
            </div>
          </div>
          <div class="list">
            ${compactListRow("wallet", "main wallet", "Not stored by LC")}
            ${compactListRow("wallet", "bank card", "Not stored by LC")}
            ${compactListRow("history", "payout rail", "Licensed operator-owned")}
            ${compactListRow(gameIconLabel, "active room", `${card.table} · ${card.stakes}`)}
            ${compactListRow("shield", "withdrawal check", "Active")}
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Ready</span>
                <b>Table balance armed</b>
                <span class="activity-card-side">${card.stakes}</span>
              </div>
              <p>Room-linked cashier stays ready for ${card.table} without leaving the player flow.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill">External</span>
                <b>Pending cashout</b>
                <span class="activity-card-side">instant rail</span>
              </div>
              <p>Latest withdrawal keeps the fast payout route and verification state attached.</p>
            </div>
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-action="save">Add wallet</button>
            <button class="btn secondary" type="button" data-sheet="account">Back to account</button>
          </div>
        `;
      }

      if (type === "roles") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Roles</span><h3>Choose your path</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill gold">Role graph</span>
              <span class="account-hub-tag">${icon("shield")}single app surface</span>
            </div>
            <div class="account-hub-balance">
              <strong>4 roles</strong>
              <span>Player, dealer, studio, operator</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("play")}player-first</span>
              <span class="account-hub-tag">${icon("profile")}dealer social</span>
              <span class="account-hub-tag">${icon("shield")}operator layer</span>
            </div>
          </div>
          <div class="summary-strip">
            <div class="summary-box"><strong>4</strong><span>roles</span></div>
            <div class="summary-box"><strong>Demo</strong><span>role preview</span></div>
            <div class="summary-box win"><strong>1 app</strong><span>shared graph</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("play")}player-first</span>
            <span class="quick-link">${icon("profile")}dealer social</span>
            <span class="quick-link">${icon("shield")}operator layer</span>
          </div>
          <div class="module-grid compact-modules">
            ${moduleTile("play", "Player", {}, "primary")}
            ${moduleTile("profile", "Dealer")}
            ${moduleTile("stats", "Studio")}
            ${moduleTile("shield", "Operator")}
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Primary</span>
                <b>Player</b>
                <span class="activity-card-side">discover · follow · handoff</span>
              </div>
              <p>Discovery, following and licensed-operator handoff.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill">Social</span>
                <b>Dealer</b>
                <span class="activity-card-side">profile · chat · tips</span>
              </div>
              <p>Profile, chat, tips.</p>
            </div>
          </div>
          <div class="list">
            ${compactListRow("play", "Player", "discovery, saved creators, handoff")}
            ${compactListRow("profile", "Dealer", "profile, room, tips, messages")}
            ${compactListRow("stats", "Studio", "performance and room ops")}
            ${compactListRow("shield", "Operator", "handoff, access, reporting")}
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="account">Stay in player</button>
            <button class="btn secondary" type="button" data-sheet="watch">See live room</button>
          </div>
        `;
      }

      if (type === "compliance") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill teal">Access</span><h3>Limits and controls</h3></div>
            ${closeButton()}
          </div>
          <div class="summary-strip">
            <div class="summary-box"><strong>External</strong><span>verification</span></div>
            <div class="summary-box"><strong>Operator</strong><span>limits</span></div>
            <div class="summary-box win"><strong>External</strong><span>session controls</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("shield")}withdrawal check</span>
            <span class="quick-link">${icon("history")}cool-off ready</span>
            <span class="quick-link">${icon("wallet")}cashier-linked</span>
          </div>
          <div class="module-grid compact-modules">
            ${moduleTile("shield", "Deposit cap", { action: "save" })}
            ${moduleTile("history", "Cool off", { action: "save" })}
            ${moduleTile("watch", "Session timer", { action: "save" })}
            ${moduleTile("wallet", "Withdrawal check", { action: "save" })}
          </div>
          <div class="list">
            ${compactListRow("shield", "age", "18+")}
            ${compactListRow("shield", "KYC", "after wallet / table")}
            ${compactListRow("shield", "geo", "operator controlled")}
            ${compactListRow("shield", "limits", "timeout / self-exclude")}
          </div>
        `;
      }

      if (type === "stats") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Stats</span><h3>${card.dealer} · ${card.game}</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill gold">Live stats</span>
              <span class="account-hub-tag">${icon("watch")}${card.watching}</span>
            </div>
            <div class="account-hub-balance">
              <strong>${card.join}</strong>
              <span>Room quality</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("limit")}${card.stakes}</span>
              <span class="account-hub-tag">${icon("seat")}${card.seat} open</span>
              <span class="account-hub-tag">${icon("trend")}${card.trend}</span>
            </div>
          </div>
          <div class="summary-strip">
            <div class="summary-box"><strong>${card.watching}</strong><span>watching</span></div>
            <div class="summary-box"><strong>${card.join}</strong><span>entry signal</span></div>
            <div class="summary-box"><strong>${card.arpu}</strong><span>avg value</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("lang")}${card.language}</span>
            <span class="quick-link">${icon("limit")}${card.stakes}</span>
            <span class="quick-link">${icon(gameIconLabel)}${roomSignal}</span>
          </div>
          <div class="history-row">
            <span class="history-pill live">${card.table}</span>
            <span class="history-pill">${card.game}</span>
            <span class="history-pill win">${card.trend}</span>
          </div>
          <div class="list">
            ${compactListRow("limit", "limits", card.stakes)}
            ${compactListRow("seat", "open seats", card.seat)}
            ${compactListRow("trend", "trend", card.trend)}
            ${compactListRow("profile", "followers", card.follows)}
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="gameplay">Open table</button>
            <button class="btn secondary" type="button" data-sheet="watch">Back to room</button>
          </div>
        `;
      }

      if (type === "info") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill">Info</span><h3>${card.table}</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill">Table info</span>
              <span class="account-hub-tag">${icon("lang")}${card.language}</span>
            </div>
            <div class="account-hub-balance">
              <strong>${card.table}</strong>
              <span>Table data</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("play")}${card.game}</span>
              <span class="account-hub-tag">${icon("limit")}${card.stakes}</span>
              <span class="account-hub-tag">${icon("seat")}${card.seat} open</span>
            </div>
          </div>
          <div class="list">
            ${compactListRow("play", "game", card.game)}
            ${compactListRow("lang", "language", card.language)}
            ${compactListRow("limit", "limits", card.stakes)}
            ${compactListRow("tip", "tips", "Available")}
            ${compactListRow("seat", "open seats", card.seat)}
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="gameplay">Open table</button>
            <button class="btn secondary" type="button" data-sheet="profile">Dealer</button>
          </div>
        `;
      }

      if (type === "tips") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Tips</span><h3>${card.dealer}</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill gold">Dealer tips</span>
              <span class="account-hub-tag">${icon("wallet")}wallet-linked</span>
            </div>
            <div class="account-hub-balance">
              <strong>External</strong>
              <span>Illustrative tip flow</span>
            </div>
            <div class="account-hub-strip">
              <span class="account-hub-tag">${icon("tip")}No result data</span>
              <span class="account-hub-tag">${icon("watch")}Illustrative records</span>
              <span class="account-hub-tag">${icon("history")}off-table</span>
            </div>
          </div>
          <div class="account-balance-row">
            <div class="account-balance-card primary"><strong>External</strong><span>tip balance</span></div>
            <div class="account-balance-card"><strong>Not measured</strong><span>sent this week</span></div>
            <div class="account-balance-card"><strong>Demo</strong><span>tip records</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("tip")}off-table</span>
            <span class="quick-link">${icon("wallet")}wallet-linked</span>
            <span class="quick-link">${icon(gameIconLabel)}${card.table}</span>
          </div>
          <div class="module-grid">
            <button class="module-card detail primary" type="button" data-action="tip">${icon("tip")}<strong>Preview quick thanks</strong><span>Illustrative dealer gesture.</span></button>
            <button class="module-card detail" type="button" data-action="tip">${icon("tip")}<strong>Preview table energy</strong><span>Illustrative social signal.</span></button>
            <button class="module-card detail" type="button" data-action="tip">${icon("tip")}<strong>Preview hand momentum</strong><span>Illustrative table moment.</span></button>
            <button class="module-card detail" type="button" data-action="tip">${icon("tip")}<strong>Preview VIP moment</strong><span>Illustrative room signal.</span></button>
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Demo</span>
                <b>${card.dealer}</b>
                <span class="activity-card-side">2h ago</span>
              </div>
              <p>Sent after saved-room return.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill">Demo</span>
                <b>Sofia · Blackjack Royal</b>
                <span class="activity-card-side">yesterday</span>
              </div>
              <p>VIP tip after strong hand flow.</p>
            </div>
          </div>
          <div class="list">
            ${compactListRow("tip", "tip status", "separate from bets")}
            ${compactListRow("wallet", "settlement", "wallet-linked")}
            ${compactListRow("watch", "favorite room", `${card.dealer} · ${card.table}`)}
          </div>
          <div class="demo-disclaimer">Illustrative only. LC does not store wallet, wagering or settlement data.</div>
        `;
      }

      if (type === "message") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill teal">Messages</span><h3>Inbox and dealer chat</h3></div>
            ${closeButton()}
          </div>
          <div class="account-hub">
            <div class="account-hub-top">
              <span class="pill teal">Inbox</span>
              <span class="account-hub-tag">${icon("chat")}3 unread</span>
            </div>
            <div class="account-hub-balance">
              <strong>${card.dealer}</strong>
              <span>Dealer-linked inbox</span>
            </div>
          <div class="account-hub-strip">
            <span class="account-hub-tag">${icon("watch")}room linked</span>
            <span class="account-hub-tag">${icon("seat")}seat requests</span>
            <span class="account-hub-tag">${icon(gameIconLabel)}${roomMode}</span>
          </div>
          </div>
          <div class="message-draft">
            <div class="sheet-section-head"><strong>Draft</strong><span>live room</span></div>
            <div class="message-draft-field">${roomDraft}</div>
          </div>
          <div class="history-row">
            <span class="history-pill live">dealer chat</span>
            <span class="history-pill">saved room</span>
            <span class="history-pill win">fast reply</span>
          </div>
          <div class="module-grid compact-modules">
            <button class="module-card detail" type="button" data-action="message">${icon("chat")}<strong>${card.dealer}, good luck tonight</strong><span>${roomMode} note.</span></button>
            <button class="module-card detail" type="button" data-action="message">${icon("seat")}<strong>${roomQuickAsk}</strong><span>Seat check.</span></button>
            <button class="module-card detail" type="button" data-action="message">${icon("watch")}<strong>Save this room for later</strong><span>Room bookmark.</span></button>
            <button class="module-card detail" type="button" data-action="message">${icon("tip")}<strong>Great ${roomSignal.toLowerCase()}</strong><span>Quick social note.</span></button>
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Unread</span>
                <b>${card.dealer}</b>
                <span class="activity-card-side">${card.table}</span>
              </div>
              <p>${card.dealer} keeps the room warm and the next entry point attached to this table.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill">Saved</span>
                <b>Seat request queued</b>
                <span class="activity-card-side">${roomMode}</span>
              </div>
              <p>The request stays tied to ${card.seat} open seats and the current room signal.</p>
            </div>
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-action="message">Send message</button>
            <button class="btn secondary" type="button" data-sheet="saved">Saved rooms</button>
          </div>
        `;
      }

      if (type === "roulette-board") {
        const state = gameplayState(card);
        const memory = gameplayMemory(card);
        const view = memory.boardView || "main";
        const chipValue = rouletteChipValue(memory);
        const resultNumber = Number(state.resultNumber);
        const outsideHits = rouletteOutsideHits(resultNumber);
        const selectedSpecial = new Set(memory.selectedSpecial || []);
        const chipAttr = (active) => active ? ` data-chip-value="${chipValue}"` : "";
        const numberButton = (value) => {
          const active = memory.selectedNumbers.includes(value);
          const hit = resultNumber === value;
          return `<button class="roulette-cell ${rouletteNumberColor(value)} ${active ? "chipped" : ""} ${hit ? "hit" : ""}" type="button" data-roulette-bet="number:${value}"${chipAttr(active)} data-tap-feedback>${value}</button>`;
        };
        const outsideButton = (key, label) => {
          const active = memory.selectedOutside.includes(key);
          const hit = outsideHits.includes(key);
          return `<button class="outside-cell ${active ? "chipped" : ""} ${hit ? "hit" : ""}" type="button" data-roulette-bet="outside:${key}"${chipAttr(active)} data-tap-feedback>${label}</button>`;
        };
        const streetButton = (key) => {
          const config = rouletteSpecialConfig[key];
          const active = selectedSpecial.has(key);
          const hit = config.numbers.includes(resultNumber);
          return `<button class="street-cell ${active ? "chipped" : ""} ${hit ? "hit" : ""}" type="button" data-roulette-bet="special:${key}"${chipAttr(active)} data-tap-feedback>${config.shortLabel}</button>`;
        };
        const lineButton = (key) => {
          const config = rouletteSpecialConfig[key];
          const active = selectedSpecial.has(key);
          const hit = config.numbers.includes(resultNumber);
          return `<button class="line-cell ${active ? "chipped" : ""} ${hit ? "hit" : ""}" type="button" data-roulette-bet="special:${key}"${chipAttr(active)} data-tap-feedback>${config.shortLabel}</button>`;
        };
        const specialButton = (key) => {
          const config = rouletteSpecialConfig[key];
          const active = selectedSpecial.has(key);
          const hit = config.numbers.includes(resultNumber);
          return `<button class="roulette-special-chip ${active ? "chipped" : ""} ${hit ? "hit" : ""}" type="button" data-roulette-bet="special:${key}"${chipAttr(active)} data-tap-feedback><b>${config.shortLabel}</b><small>x${config.payout + 1}</small></button>`;
        };
        const cells = Array.from({ length: 36 }, (_, index) => numberButton(index + 1)).join("");
        const selectionSummary = rouletteSelectedCount(memory)
          ? rouletteSelectionStripMarkup(memory, { compact: true, max: 7, liveFirst: true })
          : '<div class="gameplay-stream-note">Select numbers or sectors.</div>';
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Board</span><h3>${card.table}</h3></div>
            ${closeButton()}
          </div>
          <div class="roulette-board-summary">
            <div class="roulette-board-head">
              <strong>${rouletteSelectedCount(memory) ? `${rouletteSelectedCount(memory)} bets live` : "Build the roulette map"}</strong>
              <span>${money(rouletteStake(memory))} stake · +${money(roulettePotential(memory))}</span>
            </div>
            ${selectionSummary}
            ${betChipRailMarkup([5, 10, 25, 100], memory.betChip)}
            <div class="roulette-board-tabs">
              <button class="roulette-board-tab ${view === "main" ? "active" : ""}" type="button" data-roulette-view="main">Numbers</button>
              <button class="roulette-board-tab ${view === "special" ? "active" : ""}" type="button" data-roulette-view="special">Splits & blocks</button>
            </div>
          </div>
          <div class="roulette-board">
            ${view === "main" ? `
              <div class="roulette-board-main">
                <div class="roulette-grid-shell">
                  <button class="roulette-zero ${memory.selectedNumbers.includes(0) ? "chipped" : ""} ${resultNumber === 0 ? "hit" : ""}" type="button" data-roulette-bet="number:0"${chipAttr(memory.selectedNumbers.includes(0))} data-tap-feedback>0</button>
                  <div class="roulette-grid">${cells}</div>
                  <div class="roulette-street-rail">${rouletteStreetKeys.map((key) => streetButton(key)).join("")}</div>
                </div>
                <div class="line-grid">${rouletteLineKeys.map((key) => lineButton(key)).join("")}</div>
                ${rouletteBoardLayout.outsideRows.map((row) => `<div class="outside-grid">${row.map(([key, label]) => outsideButton(key, label)).join("")}</div>`).join("")}
                <div class="outside-grid">${rouletteBoardLayout.dozens.map(([key, label]) => outsideButton(key, label)).join("")}</div>
                <div class="column-grid">${rouletteBoardLayout.columns.map(([key, label]) => outsideButton(key, label)).join("")}</div>
              </div>
            ` : `
              <div class="roulette-special-layout">
                <div class="roulette-special-section">
                  <div><strong>Wheel sectors</strong></div>
                  <div class="roulette-special-grid">${rouletteSectorCalls.map((entry) => rouletteNumberGroupMarkup(memory, entry.numbers, entry.label, entry.meta)).join("")}</div>
                </div>
                <div class="roulette-special-section">
                  <div><strong>Neighbours</strong></div>
                  <div class="roulette-special-grid compact">${rouletteNeighborCalls.map((entry) => rouletteNumberGroupMarkup(memory, entry.numbers, entry.label, entry.meta)).join("")}</div>
                </div>
                <div class="roulette-special-section">
                  <div><strong>Zero calls</strong></div>
                  <div class="roulette-special-grid">${["trio:0-1-2", "trio:0-2-3", ...rouletteSplitZeroKeys].map((key) => specialButton(key)).join("")}</div>
                </div>
                <div class="roulette-special-section">
                  <div><strong>Corners</strong></div>
                  <div class="roulette-special-grid compact">${rouletteCornerKeys.map((key) => specialButton(key)).join("")}</div>
                </div>
                <div class="roulette-special-section">
                  <div><strong>Horizontal splits</strong></div>
                  <div class="roulette-special-grid compact">${rouletteSplitHorizontalKeys.map((key) => specialButton(key)).join("")}</div>
                </div>
                <div class="roulette-special-section">
                  <div><strong>Vertical splits</strong></div>
                  <div class="roulette-special-grid compact">${rouletteSplitVerticalKeys.map((key) => specialButton(key)).join("")}</div>
                </div>
              </div>
            `}
          </div>
          <div class="sheet-actions">
            <button class="btn secondary" type="button" data-roulette-repeat="1">Repeat</button>
            <button class="btn secondary" type="button" data-roulette-clear="1">Clear</button>
            <button class="btn" type="button" data-sheet="gameplay">Back to game</button>
          </div>
        `;
      }

      if (type === "gameplay") {
        return gameplayMarkup(card);
      }

      if (type === "search") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill">Explore</span><h3>Session previews</h3></div>
            ${closeButton()}
          </div>
          <div class="list">
            <div class="list-row"><b>Roulette</b><span>Illustrative catalog</span></div>
            <div class="list-row"><b>Blackjack</b><span>Illustrative catalog</span></div>
            <div class="list-row"><b>Baccarat</b><span>Illustrative catalog</span></div>
            <div class="list-row"><b>Poker</b><span>Illustrative catalog</span></div>
            <div class="list-row"><b>Limits</b><span>Operator-defined</span></div>
            <div class="list-row"><b>Availability</b><span>Not connected</span></div>
          </div>
        `;
      }

      if (type === "alerts") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill gold">Alerts</span><h3>Return loop</h3></div>
            ${closeButton()}
          </div>
          <div class="summary-strip">
            <div class="summary-box"><strong>4</strong><span>alerts on</span></div>
            <div class="summary-box"><strong>4</strong><span>preview records</span></div>
            <div class="summary-box win"><strong>Not measured</strong><span>return lift</span></div>
          </div>
          <div class="quick-link-row">
            <span class="quick-link">${icon("watch")}${card.dealer} preview</span>
            <span class="quick-link">${icon("seat")}Illustrative seat signal</span>
            <span class="quick-link">${icon(gameIconLabel)}${roomSignal}</span>
          </div>
          <div class="module-grid compact-modules">
            ${moduleTile("watch", "Session preview", { sheet: "watch" }, "primary")}
            ${moduleTile("seat", "Seat alert", { action: "save" })}
            ${moduleTile("trend", "Trend alert", { action: "save" })}
            ${moduleTile("wallet", "Promo alert", { action: "save" })}
          </div>
          <div class="list">
            <div class="list-row"><b>${card.dealer} preview available</b><span>${card.table}</span></div>
            <div class="list-row"><b>Illustrative seat signal</b><span>Demo only</span></div>
            <div class="list-row"><b>${roomSignal}</b><span>${card.state}</span></div>
            <div class="list-row"><b>Operator promo</b><span>${card.operator}</span></div>
          </div>
          <div class="activity-stack">
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill live">Preview</span>
                <b>${card.dealer} session preview</b>
                <span class="activity-card-side">${card.watching}</span>
              </div>
              <p>High-intent alert returns the player into the same room instead of a generic lobby.</p>
            </div>
            <div class="activity-card">
              <div class="activity-card-top">
                <span class="history-pill win">${roomSignal}</span>
                <b>${card.state}</b>
                <span class="activity-card-side">${card.trend}</span>
              </div>
              <p>Signal-based alerts stay readable and map directly to the active table context.</p>
            </div>
          </div>
          <div class="sheet-actions flush">
            <button class="btn" type="button" data-sheet="watch">Open preview</button>
            <button class="btn secondary" type="button" data-sheet="saved">Manage alerts</button>
          </div>
        `;
      }

      if (type === "insights") {
        return `
          <div class="sheet-head">
            <div class="sheet-title"><span class="pill teal">Industry fit</span><h3>Why it matters</h3></div>
            ${closeButton()}
          </div>
          <div class="proof-hero">
            <div><strong>Discovery starts before gameplay</strong><span>The app keeps creator discovery clean, then opens table context and operator entry without turning the first screen into a casino back office.</span></div>
            <b>To be validated</b>
          </div>
          <div class="proof-grid">
            <div class="proof-card"><strong>Follow</strong><span>creator relationship</span></div>
            <div class="proof-card"><strong>Live</strong><span>table context</span></div>
            <div class="proof-card"><strong>Return</strong><span>session reminder</span></div>
            <div class="proof-card"><strong>Handoff</strong><span>operator-owned play</span></div>
          </div>
          <div class="proof-ladder">
            <div><strong>Discover</strong><span>Swipe live dealer feed</span></div>
            <div><strong>Engage</strong><span>Watch, follow, alert</span></div>
            <div><strong>Convert</strong><span>Table entry</span></div>
            <div><strong>Return</strong><span>Reminder and handoff context</span></div>
          </div>
          <div class="revenue-stack">
            <div class="deal-row"><b>Operator role</b><span>licensed table and player account</span></div>
            <div class="deal-row"><b>Provider role</b><span>game and stream infrastructure</span></div>
            <div class="deal-row"><b>LC App role</b><span>creator discovery and return context</span></div>
            <div class="deal-row"><b>Status</b><span>concept demo, outcomes to validate</span></div>
          </div>
          <div class="pilot-timeline">
            <div class="pilot-step"><strong>Discover</strong><span>Find creators and session previews.</span></div>
            <div class="pilot-step"><strong>Follow</strong><span>Keep the relationship after a session.</span></div>
            <div class="pilot-step"><strong>Return</strong><span>Continue through the licensed operator flow.</span></div>
          </div>
          <div class="row-grid">
            <div class="metric"><strong>Live</strong><span>session</span></div>
            <div class="metric"><strong>Follow</strong><span>creator</span></div>
            <div class="metric"><strong>Return</strong><span>loop</span></div>
          </div>
          <div class="list">
            <div class="list-row"><b>Top surface</b><span>Feed card</span></div>
            <div class="list-row"><b>Best signal</b><span>Dealer follow</span></div>
            <div class="list-row"><b>Business path</b><span>partner discussion required</span></div>
            <div class="list-row"><b>Outcome status</b><span>to be validated</span></div>
            <div class="list-row"><b>Scale path</b><span>operator/provider fit required</span></div>
          </div>
          <p class="proof-note">Concept readout: LC App shows a potential social discovery and return layer for Live Casino. Commercial outcomes are not validated.</p>
          <div class="sheet-actions">
            <button class="btn" type="button" data-sheet="handoff">Operator handoff</button>
            <button class="btn secondary" type="button" data-sheet="watch">Back to room</button>
          </div>
        `;
      }

      return `
        <div class="sheet-head watch-sheet-head">
          <div class="sheet-title"><span class="pill teal">${card.game}</span><h3>Live room</h3></div>
          ${closeButton()}
        </div>
        <div class="hero-preview watch-hero ${(card.feedVideo || card.tableVideo) ? "has-stream" : ""} ${card.providerCapture ? "provider-capture" : ""}">
          ${watchHeroMediaMarkup(card)}
          ${card.providerCapture ? providerCaptureMatteMarkup("watch") : ""}
          <div class="watch-hero-copy">
            <div class="watch-hero-top">
              <span class="dealer-live-chip">Live</span>
              <span class="watch-hero-pill">${icon("limit")}${card.stakes}</span>
            </div>
            <div class="watch-hero-bottom">
              <div class="watch-room-caption">
                <strong>${card.table}</strong>
                <span>${card.dealer} live · ${card.operator} · ${card.language}</span>
              </div>
              <span class="watch-room-pill">${card.seat} open</span>
            </div>
          </div>
        </div>
        <div class="watch-room-summary">
          <div class="watch-room-shell">
            <div class="watch-dealer-row">
              <span class="watch-dealer-avatar"><img src="${card.image}" alt="${card.dealer} dealer portrait" style="${profileImageStyle(card)}" /></span>
              <div class="watch-dealer-copy">
                <strong>${card.dealer}</strong>
                <p>${card.read}</p>
              </div>
              <button class="watch-action-chip" type="button" data-sheet="profile">${icon("profile")}Profile</button>
            </div>
            <div class="quick-link-row">
              <span class="quick-link">${icon("trend")}${card.state}</span>
              <span class="quick-link">${icon("seat")}${card.seat} seats open</span>
              <span class="quick-link">${icon("limit")}${card.stakes}</span>
            </div>
            <div class="watch-room-stats">
              <div class="watch-room-stat"><b>${card.watching}</b><span>Watching</span></div>
              <div class="watch-room-stat"><b>${card.state}</b><span>Table status</span></div>
              <div class="watch-room-stat"><b>${card.trend}</b><span>Room signal</span></div>
            </div>
            <div class="watch-cta-grid">
              <button class="btn" type="button" data-sheet="gameplay">Open live room</button>
              <button class="btn secondary" type="button" data-sheet="saved">Save</button>
              <button class="btn secondary" type="button" data-sheet="message">Message</button>
            </div>
          </div>
          <div class="watch-meta-list">
            <div class="watch-meta-card"><strong>${card.operator}</strong><span>Operator</span></div>
            <div class="watch-meta-card"><strong>${card.stakes}</strong><span>Limits</span></div>
            <div class="watch-meta-card"><strong>${card.language}</strong><span>Language</span></div>
            <div class="watch-meta-card"><strong>${card.follows}</strong><span>Followers</span></div>
          </div>
        </div>
      `;
    }

    function openSheet(type) {
      if (type === "account") {
        closeSheet();
        setView("account");
        showToast("Account");
        return;
      }
      const previousType = currentSheetType;
      const card = item();
      setCleanView(false);
      closeHomeMenu();
      dealerRailOpen = false;
      renderChromeState();
      if (type === "gameplay") {
        if (previousType !== "gameplay") {
          markGameplayEntry(card, previousType === "watch" ? "watch" : "feed");
          gameplayMenuByCard[card.id] = false;
          gameplayChatByCard[card.id] = false;
        } else {
          syncCameraState(card, false);
        }
      }
      currentSheetType = type;
      sheetPanel.innerHTML = sheetMarkup(type);
      sheet.classList.add("open");
      sheet.classList.toggle("watch-open", type === "watch");
      sheet.classList.toggle("gameplay-open", type === "gameplay");
      sheet.setAttribute("aria-hidden", "false");
      renderChromeState();
      syncStreamPlayback();
      if (["watch", "gameplay"].includes(type)) startLiveRoundTimer();
    }

    function closeSheet() {
      window.clearTimeout(liveRoundTimer);
      currentSheetType = null;
      sheet.classList.remove("open");
      sheet.classList.remove("watch-open");
      sheet.classList.remove("gameplay-open");
      sheet.setAttribute("aria-hidden", "true");
      renderChromeState();
      syncStreamPlayback();
    }

    render();

    let timer = 0;
    feed.addEventListener("scroll", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        active = Math.max(0, Math.min(cards.length - 1, Math.round(feed.scrollTop / feed.clientHeight)));
        syncSide();
        if (currentSheetType) openSheet(currentSheetType);
      }, 60);
    });

    stories.addEventListener("click", (event) => {
      const story = event.target.closest(".story");
      if (story) goTo(Number(story.dataset.index));
    });

    if (homeStories) {
      homeStories.addEventListener("click", (event) => {
        const story = event.target.closest(".story");
        if (story) goTo(Number(story.dataset.index));
      });
    }

    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-sheet]");
      const close = event.target.closest("[data-close]");
      const nav = event.target.closest(".nav");
      const tab = event.target.closest(".tab");
      const demo = event.target.closest("[data-demo-state]");
      const anyAction = event.target.closest("[data-action]");
      const tapFeedback = event.target.closest("[data-tap-feedback]");
      const gameMenu = event.target.closest("[data-game-menu]");
      const gameChat = event.target.closest("[data-game-chat]");
      const homeMenuToggle = event.target.closest("[data-home-menu]");
      const accountRoom = event.target.closest("[data-account-room]");
      const railToggle = event.target.closest("[data-reveal-rail]");
      const liveToggle = event.target.closest("[data-live-toggle]");
      const liveStep = event.target.closest("[data-live-step]");
      const liveReset = event.target.closest("[data-live-reset]");
      const betChip = event.target.closest("[data-bet-chip]");
      const rouletteNumbersGroup = event.target.closest("[data-roulette-numbers]");
      const rouletteBet = event.target.closest("[data-roulette-bet]");
      const rouletteView = event.target.closest("[data-roulette-view]");
      const rouletteClear = event.target.closest("[data-roulette-clear]");
      const rouletteRepeat = event.target.closest("[data-roulette-repeat]");
      const blackjackAction = event.target.closest("[data-blackjack-action]");
      const pokerAction = event.target.closest("[data-poker-action]");
      const baccaratSide = event.target.closest("[data-baccarat-side]");
      const introStart = event.target.closest("[data-intro-start]");
      const introClose = event.target.closest("[data-intro-close]");

      if (tapFeedback) {
        tapFeedback.classList.remove("pressed");
        void tapFeedback.offsetWidth;
        tapFeedback.classList.add("pressed");
        window.clearTimeout(tapFeedback._tapTimer);
        tapFeedback._tapTimer = window.setTimeout(() => tapFeedback.classList.remove("pressed"), 180);
      }
      if (introStart || introClose) hideIntro(Boolean(introStart));
      if (accountRoom) {
        goTo(Number(accountRoom.dataset.accountRoom));
        showToast("Room updated");
      }
      if (railToggle && !currentSheetType && currentView === "home") revealDealerRail();
      if (homeMenuToggle) {
        toggleHomeMenu();
      }
      if (gameMenu) {
        const card = item();
        gameplayMenuByCard[card.id] = !isGameplayMenuOpen(card);
        refreshSheet();
      }
      if (gameChat) {
        const card = item();
        gameplayChatByCard[card.id] = !isGameplayChatOpen(card);
        refreshSheet();
      }
      if (betChip) {
        const card = item();
        const memory = gameplayMemory(card);
        const value = Number(betChip.dataset.betChip);
        if (card.game === "Roulette") memory.betChip = value;
        else memory.stake = value;
        if (card.game === "Roulette") rememberRouletteSelection(memory);
        commitGameplayMemory(card);
      }
      if (rouletteView) {
        const card = item();
        gameplayMemory(card).boardView = rouletteView.dataset.rouletteView;
        refreshSheet();
      }
      if (rouletteNumbersGroup) {
        const card = item();
        const memory = gameplayMemory(card);
        const values = rouletteNumbersGroup.dataset.rouletteNumbers.split(",").map((value) => Number(value)).filter((value) => Number.isFinite(value));
        toggleNumberGroup(memory.selectedNumbers, values);
        rememberRouletteSelection(memory);
        commitGameplayMemory(card);
      }
      if (rouletteBet) {
        const card = item();
        const memory = gameplayMemory(card);
        const rawValue = rouletteBet.dataset.rouletteBet;
        const splitIndex = rawValue.indexOf(":");
        const type = splitIndex >= 0 ? rawValue.slice(0, splitIndex) : rawValue;
        const raw = splitIndex >= 0 ? rawValue.slice(splitIndex + 1) : "";
        if (type === "number") toggleValue(memory.selectedNumbers, Number(raw));
        if (type === "outside") toggleValue(memory.selectedOutside, raw);
        if (type === "special") toggleValue(memory.selectedSpecial, raw);
        rememberRouletteSelection(memory);
        commitGameplayMemory(card);
      }
      if (rouletteClear) {
        const card = item();
        const memory = gameplayMemory(card);
        rememberRouletteSelection(memory);
        memory.selectedNumbers = [];
        memory.selectedOutside = [];
        memory.selectedSpecial = [];
        commitGameplayMemory(card);
      }
      if (rouletteRepeat) {
        const card = item();
        const memory = gameplayMemory(card);
        memory.selectedNumbers = [...(memory.lastNumbers || [12])];
        memory.selectedOutside = [...(memory.lastOutside || ["red", "dozen1"])];
        memory.selectedSpecial = [...(memory.lastSpecial || [])];
        commitGameplayMemory(card);
      }
      if (blackjackAction) {
        const card = item();
        gameplayMemory(card).action = blackjackAction.dataset.blackjackAction;
        commitGameplayMemory(card);
      }
      if (pokerAction) {
        const card = item();
        gameplayMemory(card).action = pokerAction.dataset.pokerAction;
        commitGameplayMemory(card);
      }
      if (baccaratSide) {
        const card = item();
        gameplayMemory(card).selectedBet = baccaratSide.dataset.baccaratSide;
        commitGameplayMemory(card);
      }
      if (open) openSheet(open.dataset.sheet);
      if (close) closeSheet();
      if (liveToggle) {
        const card = item();
        liveRoundByCard[card.id] = !isLiveRound(card);
        if (isLiveRound(card)) startLiveRoundTimer();
        refreshSheet();
        if (currentSheetType !== "gameplay") showToast(isLiveRound(card) ? "Live round running" : "Live round paused");
      }
      if (liveStep) {
        const card = item();
        liveRoundByCard[card.id] = false;
        advanceLiveRound(card);
        if (currentSheetType !== "gameplay") showToast("Next gameplay phase");
      }
      if (liveReset) {
        const card = item();
        demoStateByCard[card.id] = 0;
        liveRoundByCard[card.id] = true;
        syncCameraState(card, currentSheetType === "gameplay");
        startLiveRoundTimer();
        refreshSheet();
        if (currentSheetType !== "gameplay") showToast("Round restarted");
      }
      if (anyAction) {
        const messages = {
          like: "Added to favorites",
          follow: `${item().dealer} followed`,
          save: "Saved for later",
          share: "Demo share action",
          tip: `Tip sheet ready for ${item().dealer}`,
          message: `Message draft opened for ${item().dealer}`
        };
        showToast(messages[anyAction.dataset.action]);
        if (event.target.closest("#homeDrawer")) closeHomeMenu();
      }
      if (demo) {
        liveRoundByCard[item().id] = false;
        demoStateByCard[item().id] = Number(demo.dataset.demoState);
        syncCameraState(item(), currentSheetType === "gameplay");
        refreshSheet();
      }
      if (nav && nav.dataset.nav) {
        closeSheet();
        setView(nav.dataset.nav);
        showToast(nav.dataset.nav === "account" ? "Account" : "Home feed");
      }
      if (tab) {
        document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        showToast(`${tab.textContent.trim()} feed`);
      }
      if (homeMenuOpen && !event.target.closest("#homeDrawer") && !homeMenuToggle) {
        closeHomeMenu();
      }
    });

    sheet.addEventListener("click", (event) => {
      if (event.target === sheet) closeSheet();
    });

    document.getElementById("nextCard").addEventListener("click", () => goTo(active + 1));
    if (!(window.LC_APP_MODE === "public_demo" && window.location.hash.startsWith("#/product"))) {
      startLiveRoundTimer();
      startSignalTimer();
    }
    window.setTimeout(() => hideIntro(false), 3600);

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") goTo(active + 1);
      if (event.key === "ArrowUp") goTo(active - 1);
      if (event.key === "Escape") closeSheet();
    });

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js", {updateViaCache: "none"}).catch(() => {});
      });
    }
