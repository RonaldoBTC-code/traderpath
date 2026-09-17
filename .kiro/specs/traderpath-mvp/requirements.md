# Requirements Document

## Introduction

TraderPath is a web-based educational open-world trading video game for Spanish-speaking players aged 16 and older, from complete beginners to experienced traders. It teaches financial markets through exploration, NPC interactions, visual analogies, RPG progression, evaluations, and a disciplined trading simulator using virtual capital. The core pedagogical principle is that the player cannot execute an action they do not understand — missions unlock mechanics sequentially.

## Glossary

- **Player**: A registered user of TraderPath who interacts with missions, the simulator, and progression systems
- **Authentication_System**: The Supabase Auth module responsible for user registration and login
- **Dashboard**: The main screen displaying player progress, current level, XP, rank, virtual capital, and available missions
- **Mission_Engine**: The system responsible for presenting missions, evaluating completion, awarding XP, and unlocking subsequent missions
- **Trading_Simulator**: The chart-based interface using TradingView Lightweight Charts where players execute virtual trades
- **Order_Panel**: The UI component within the Trading_Simulator where players configure trade parameters (direction, entry price, SL, TP, capital)
- **Pre_Operation_Checklist**: A 7-step checklist that must be fully completed before the Execute button becomes active
- **Stop_Loss (SL)**: A mandatory price level at which a losing trade automatically closes to limit losses
- **Take_Profit (TP)**: A price level at which a winning trade automatically closes to secure gains
- **Risk_Reward_Ratio (R:R)**: The ratio between potential loss (entry to SL) and potential gain (entry to TP)
- **Trading_Diary**: A journal where players record reasoning, outcome, and lessons after each simulator operation
- **XP_System**: The experience point system that tracks player progress and determines rank advancement
- **Rank**: A player title determined by accumulated XP, ranging from Novato (0 XP) to Leyenda (25,000+ XP)
- **Virtual_Capital**: In-game currency used for simulated trades, starting at $1,000 and increasing with level completion
- **Achievement_System**: The module that tracks and awards achievements based on player milestones
- **Grand_Tour**: A transition module between Level 2 and Level 3 where players explore 7 market districts and choose a specialization
- **Market_District**: One of the 7 explorable areas in the Grand_Tour representing a financial market category
- **Final_Challenge**: An end-of-level assessment requiring a minimum score of 70% to pass and advance
- **El_Especulador**: An antagonist character representing greed and impulsiveness who appears when a player attempts unsafe trading actions
- **ARIA**: The AI game assistant providing educational guidance, feedback, and contextual tips
- **El_Viejo_Marco**: The narrative guide character who delivers story-driven holographic messages
- **Pattern_Card**: A collectible reference card showing a technical analysis pattern, unlocked after completing Mission 6 of Level 2
- **Level**: A structured set of sequential missions with a Final_Challenge, associated with a specific rank tier and virtual capital amount
- **RLS**: Row Level Security policies in Supabase ensuring users can only access their own data

## Requirements

### Requirement 1: User Registration

**User Story:** As a new player, I want to register an account with email and password, so that I can save my progress and access TraderPath.

#### Acceptance Criteria

1. WHEN a player submits a valid email and password, THE Authentication_System SHALL create a new account and redirect the player to the Dashboard
2. WHEN a player submits an email that is already registered, THE Authentication_System SHALL display an error message indicating the email is already in use
3. WHEN a player submits a password shorter than 8 characters, THE Authentication_System SHALL display a validation error and prevent account creation
4. THE Authentication_System SHALL store user credentials securely using Supabase Auth with encrypted passwords

### Requirement 2: User Login

**User Story:** As a returning player, I want to log in with my credentials, so that I can resume my progress.

#### Acceptance Criteria

1. WHEN a player submits valid email and password credentials, THE Authentication_System SHALL authenticate the player and redirect to the Dashboard
2. WHEN a player submits invalid credentials, THE Authentication_System SHALL display an error message without revealing which field is incorrect
3. WHEN a player is already authenticated, THE Authentication_System SHALL redirect the player directly to the Dashboard without requiring re-login

### Requirement 3: Player Dashboard

**User Story:** As a player, I want to see my progress on a main dashboard, so that I can understand my current status and next steps.

#### Acceptance Criteria

1. THE Dashboard SHALL display the player current level, XP total, rank title, virtual capital balance, and current mission
2. THE Dashboard SHALL display a visual progress indicator showing completed missions within the current level
3. WHEN a player completes a mission, THE Dashboard SHALL update all progress indicators in real time without requiring a page refresh
4. THE Dashboard SHALL apply the dark theme consistently using background colors #0D1B2A, #1A2B3C, and #0A1628

### Requirement 4: Sequential Mission Unlock

**User Story:** As a player, I want missions to unlock one by one, so that I learn concepts in the correct pedagogical order.

#### Acceptance Criteria

1. THE Mission_Engine SHALL display only the current available mission as active and all subsequent missions as locked
2. WHEN a player completes a mission, THE Mission_Engine SHALL unlock the next mission in the sequence
3. WHEN a player attempts to access a locked mission, THE Mission_Engine SHALL prevent access and display a message indicating the prerequisite mission
4. THE Mission_Engine SHALL persist mission completion status to Supabase so that progress survives page reloads and new sessions

### Requirement 5: Mission Types and Content Delivery

**User Story:** As a player, I want varied mission types (narrative, lesson+quiz, mini-games, simulator), so that learning stays engaging.

#### Acceptance Criteria

1. WHEN a narrative mission is active, THE Mission_Engine SHALL present dialogue from El_Viejo_Marco or ARIA with character-appropriate tone and continue on player acknowledgment
2. WHEN a lesson+quiz mission is active, THE Mission_Engine SHALL present educational content followed by a quiz with immediate feedback on each answer
3. WHEN a mini-game mission is active, THE Mission_Engine SHALL load the appropriate interactive exercise and evaluate player performance
4. WHEN a simulator mission is active, THE Mission_Engine SHALL activate the Trading_Simulator with mission-specific parameters and objectives

### Requirement 6: XP and Rank Progression

**User Story:** As a player, I want to earn XP and advance in rank, so that I feel a sense of progression and achievement.

#### Acceptance Criteria

1. WHEN a player completes a mission, THE XP_System SHALL award XP based on the mission difficulty and update the player total
2. WHEN accumulated XP crosses a rank threshold, THE XP_System SHALL promote the player to the new rank and display a rank-up notification
3. THE XP_System SHALL recognize 8 ranks: Novato (0 XP), Aprendiz (1,000 XP), Analista (2,500 XP), Estratega (5,000 XP), Operador (8,500 XP), Trader (13,000 XP), Profesional (18,500 XP), and Leyenda (25,000 XP)
4. THE XP_System SHALL persist XP and rank to Supabase so that values remain consistent across sessions

### Requirement 7: Virtual Capital Management

**User Story:** As a player, I want a virtual capital balance that changes based on my trading results, so that I experience realistic consequences without real financial risk.

#### Acceptance Criteria

1. WHEN a player begins Level 1, THE XP_System SHALL initialize virtual capital to $1,000
2. WHEN a player completes Level 1, THE XP_System SHALL set virtual capital to $1,500 for Level 2
3. WHEN a player completes Level 2 and the Grand_Tour, THE XP_System SHALL set virtual capital to $2,500 for Level 3
4. WHEN a simulator operation closes with profit, THE Trading_Simulator SHALL add the profit amount to virtual capital
5. WHEN a simulator operation closes with loss, THE Trading_Simulator SHALL subtract the loss amount from virtual capital
6. IF a player attempts to operate without a Stop_Loss, THEN THE Trading_Simulator SHALL deduct $300 from virtual capital as a penalty

### Requirement 8: Trading Simulator Activation

**User Story:** As a player, I want the trading simulator locked until I learn risk management, so that I do not trade without foundational knowledge.

#### Acceptance Criteria

1. WHILE a player has not completed Mission 4 of Level 1, THE Trading_Simulator SHALL remain locked and display a message explaining that risk management knowledge is required
2. WHEN a player completes Mission 4 of Level 1, THE Trading_Simulator SHALL unlock and become accessible for simulator-type missions
3. WHEN a player accesses the Trading_Simulator, THE Trading_Simulator SHALL display a TradingView Lightweight Charts widget with real-time-style price data and the Order_Panel

### Requirement 9: Trade Execution Validation

**User Story:** As a player, I want the system to enforce safe trading practices before I can execute a trade, so that I build disciplined habits.

#### Acceptance Criteria

1. WHILE the Pre_Operation_Checklist has unchecked items, THE Order_Panel SHALL keep the Execute button disabled
2. WHILE no Stop_Loss value is set in the Order_Panel, THE Order_Panel SHALL keep the Execute button disabled
3. WHILE the Risk_Reward_Ratio is below 1:2, THE Order_Panel SHALL keep the Execute button disabled and display the current R:R value with a warning
4. WHEN all 7 checklist items are checked, a valid Stop_Loss is set, and the R:R is at least 1:2, THE Order_Panel SHALL enable the Execute button
5. IF a player attempts to bypass the Stop_Loss requirement through any UI interaction, THEN THE Trading_Simulator SHALL trigger the El_Especulador antagonist sequence and deduct $300 from virtual capital

### Requirement 10: El Especulador Antagonist Intervention

**User Story:** As a player, I want to face consequences for undisciplined trading attempts, so that I internalize risk management principles.

#### Acceptance Criteria

1. WHEN a player attempts to execute a trade without a Stop_Loss, THE Mission_Engine SHALL display El_Especulador with a narrative dialogue about the dangers of trading without protection
2. WHEN El_Especulador appears, THE XP_System SHALL deduct $300 from the player virtual capital
3. WHEN El_Especulador completes the dialogue, THE Trading_Simulator SHALL return the player to the Order_Panel with the Stop_Loss field highlighted

### Requirement 11: Pre-Operation Checklist

**User Story:** As a player, I want a checklist before each trade, so that I develop a systematic pre-trade routine.

#### Acceptance Criteria

1. WHEN a player opens the Order_Panel for a new trade, THE Trading_Simulator SHALL display the 7-step Pre_Operation_Checklist with all items unchecked
2. THE Pre_Operation_Checklist SHALL include steps for: identifying trend direction, marking support/resistance, confirming entry signal, setting Stop_Loss, setting Take_Profit, verifying R:R ratio, and confirming position size
3. WHEN the player checks all 7 items, THE Pre_Operation_Checklist SHALL visually indicate completion with a green confirmation state

### Requirement 12: Trading Diary

**User Story:** As a player, I want to record my reasoning and outcome after each trade, so that I develop reflective trading habits.

#### Acceptance Criteria

1. WHEN a simulator operation closes (by hitting SL, TP, or manual close), THE Trading_Diary SHALL present a mandatory entry form before the player can proceed
2. THE Trading_Diary SHALL require the player to fill in: asset traded, direction, entry price, Stop_Loss, Take_Profit, order type, reasoning for the trade, and emotional state
3. WHEN the player submits a complete diary entry, THE Trading_Diary SHALL save the entry to Supabase and allow the player to proceed to the next activity
4. WHEN the player attempts to dismiss the diary form without completing it, THE Trading_Diary SHALL prevent dismissal and highlight required fields

### Requirement 13: Achievement System

**User Story:** As a player, I want to unlock achievements for milestones, so that I feel rewarded for consistent progress.

#### Acceptance Criteria

1. WHEN a player meets an achievement condition, THE Achievement_System SHALL unlock the achievement and display a popup notification with the achievement name, description, and XP reward
2. THE Achievement_System SHALL track 7 achievements: completing first mission, completing Level 1, completing first simulator trade, maintaining a 3-day streak, completing the Grand_Tour, completing Level 3, and achieving a 5-trade profit streak
3. WHEN an achievement is unlocked, THE Achievement_System SHALL award the associated XP bonus and persist the achievement to Supabase
4. THE Dashboard SHALL display unlocked achievements in a dedicated achievements section

### Requirement 14: Final Challenge Assessment

**User Story:** As a player, I want a final challenge at the end of each level, so that I can prove mastery before advancing.

#### Acceptance Criteria

1. WHEN a player completes all missions in a level, THE Mission_Engine SHALL unlock the Final_Challenge for that level
2. WHEN a player scores 70% or higher on a Final_Challenge, THE Mission_Engine SHALL mark the level as complete and unlock the next level or the Grand_Tour
3. WHEN a player scores below 70% on a Final_Challenge, THE Mission_Engine SHALL display the score, provide feedback on weak areas, and allow the player to retry
4. WHEN the player completes the Final_Challenge of Level 2, THE Mission_Engine SHALL activate the Grand_Tour module

### Requirement 15: Grand Tour of Markets

**User Story:** As a player, I want to explore different market types before choosing a specialization, so that I make an informed choice about my trading path.

#### Acceptance Criteria

1. WHEN a player enters the Grand_Tour, THE Grand_Tour SHALL display an interactive map with 7 Market_Districts representing Forex, Stocks, Commodities, Indices, Futures, ETFs, and Cryptocurrency
2. THE Grand_Tour SHALL track which Market_Districts the player has visited
3. WHILE a player has not visited all 7 Market_Districts, THE Grand_Tour SHALL prevent the player from choosing a specialization and display the remaining districts to visit
4. WHEN the player has visited all 7 Market_Districts, THE Grand_Tour SHALL present a compatibility test to recommend a market and allow the player to confirm a choice
5. THE Grand_Tour SHALL record the chosen market in the player profile and unlock Level 3 for that market (Cryptocurrency route in MVP)

### Requirement 16: Market Change Rule

**User Story:** As a player, I want the option to change my market specialization once, so that I can correct my choice if needed.

#### Acceptance Criteria

1. WHILE a player has not used the market change, THE Mission_Engine SHALL display a "Change Market" option in Level 3 settings
2. WHEN a player activates the market change, THE Mission_Engine SHALL present the available markets and allow selection of a new market
3. WHEN a player confirms a market change, THE Mission_Engine SHALL update the player market, reset Level 3 progress for the new market, and mark the market change as used
4. WHILE a player has already used the market change, THE Mission_Engine SHALL hide the "Change Market" option and display a message that the single change has been used

### Requirement 17: Pattern Cards

**User Story:** As a player, I want to collect pattern cards as references, so that I have a library of technical analysis patterns for future use.

#### Acceptance Criteria

1. WHEN a player completes Level 2, THE Mission_Engine SHALL unlock the Pattern_Card collection feature
2. WHEN Pattern_Cards are unlocked, THE Dashboard SHALL display a "Pattern Cards" section showing all collected cards
3. WHEN a player earns a new Pattern_Card through mission completion, THE Mission_Engine SHALL display the card with its pattern name, visual diagram, and key characteristics

### Requirement 18: Character Dialogue System

**User Story:** As a player, I want characters to appear at contextually appropriate moments, so that the narrative feels immersive and educational.

#### Acceptance Criteria

1. WHEN a narrative moment is triggered, THE Mission_Engine SHALL display the appropriate character (El_Viejo_Marco, ARIA, El_Especulador, La_Señorita_FOMO, or Don_Pánico) with styled dialogue matching the character personality
2. WHEN ARIA provides feedback after a simulator operation, THE Mission_Engine SHALL display ARIA with contextual advice based on the trade outcome and diary entry
3. THE Mission_Engine SHALL use El_Viejo_Marco for story progression, ARIA for educational guidance and trade feedback, and antagonists for consequence-driven moments

### Requirement 19: Data Persistence and Session Management

**User Story:** As a player, I want my progress saved automatically, so that I never lose progress due to closing the browser or losing connection.

#### Acceptance Criteria

1. WHEN a player completes any progress-affecting action (mission completion, trade execution, achievement unlock), THE Mission_Engine SHALL persist the change to Supabase within 2 seconds
2. WHEN a player loads the application after a previous session, THE Dashboard SHALL restore all progress data (level, missions, XP, rank, capital, achievements, diary entries) from Supabase
3. THE Authentication_System SHALL enforce Row Level Security policies so that each player can only read and write their own data
4. IF a network error occurs during a save operation, THEN THE Mission_Engine SHALL retry the save operation and display a warning indicator until the data is successfully persisted

### Requirement 20: Responsive Design and Theme

**User Story:** As a player, I want TraderPath to work on mobile devices and maintain a consistent dark theme, so that I can learn on any device with an immersive experience.

#### Acceptance Criteria

1. THE Dashboard SHALL render correctly on viewport widths from 320px to 1920px using responsive breakpoints
2. THE Trading_Simulator SHALL adapt the chart and Order_Panel layout for mobile viewports (below 768px width) without losing functionality
3. THE Dashboard SHALL apply the dark theme using background colors #0D1B2A, #1A2B3C, and #0A1628, accent colors green #00C896, gold #FFD700, red #FF4757, and blue #4A90E2 consistently across all screens
4. THE Dashboard SHALL use Inter font for body text and JetBrains Mono font for price and numerical displays

### Requirement 21: Open-World Educational Map

**User Story:** As a player, I want to explore representative financial cities and discover lessons through NPC and visual interactions, so that learning feels like an adventure rather than a traditional course.

#### Acceptance Criteria

1. THE World_Map SHALL represent Cryptocurrency, Forex, Stocks, Commodities, Indices, Futures, and ETFs as visually distinct cities or districts
2. THE World_Map SHALL expose educational points of interest and NPC interactions while preserving sequential prerequisite rules
3. WHEN a player enters an educational point, THE Mission_Engine SHALL present a visual analogy, a guided interaction, randomized practice, and a final block assessment
4. WHEN a player passes the assessment, THE World_Map SHALL unlock the corresponding mechanic, mission, or destination
5. THE first complete vertical slice SHALL teach supply, demand, and price through an interactive apple market scene
