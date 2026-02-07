// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title Pingsut
 * @dev Rock Paper Scissors with Commit-Reveal and Tiered Wagering
 * Tiers:
 * A: 0.1 MON
 * B: 0.2 MON
 * C: 0.3 MON
 * D: 0.4 MON
 * E: 0.5 MON
 */
contract Pingsut {
    enum Move { None, Rock, Paper, Scissors }
    enum Tier { A, B, C, D, E }

    struct Game {
        address player1;
        address player2;
        uint256 wager;
        Tier tier;
        bytes32 commitment1; // keccak256(move1, salt)
        Move move2;
        bool completed;
        uint256 startTime;
        uint256 revealDeadline; // Deadline for Player 1 to reveal
    }

    uint256 public constant REVEAL_TIMEOUT = 30 seconds;
    uint256 public gameCount;
    mapping(uint256 => Game) public games;
    mapping(Tier => uint256) public tierWagers;

    event GameCreated(uint256 indexed gameId, address indexed creator, Tier tier, uint256 wager);
    event GameJoined(uint256 indexed gameId, address indexed opponent);
    event GameResolved(uint256 indexed gameId, address winner, uint256 payout);
    event GameDraw(uint256 indexed gameId);
    event GameTimedOut(uint256 indexed gameId, address winner);

    constructor() {
        tierWagers[Tier.A] = 0.1 ether;
        tierWagers[Tier.B] = 0.2 ether;
        tierWagers[Tier.C] = 0.3 ether;
        tierWagers[Tier.D] = 0.4 ether;
        tierWagers[Tier.E] = 0.5 ether;
    }

    function createGame(Tier tier, bytes32 commitment) external payable returns (uint256) {
        uint256 requiredWager = tierWagers[tier];
        require(msg.value == requiredWager, "Incorrect wager amount");
        
        uint256 gameId = ++gameCount;
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            wager: requiredWager,
            tier: tier,
            commitment1: commitment,
            move2: Move.None,
            completed: false,
            startTime: block.timestamp,
            revealDeadline: 0
        });

        emit GameCreated(gameId, msg.sender, tier, requiredWager);
        return gameId;
    }

    function joinGame(uint256 gameId, Move move2) external payable {
        Game storage game = games[gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already has an opponent");
        require(msg.sender != game.player1, "Cannot play against yourself");
        require(msg.value == game.wager, "Incorrect wager amount");
        require(move2 != Move.None, "Invalid move");

        game.player2 = msg.sender;
        game.move2 = move2;
        game.revealDeadline = block.timestamp + REVEAL_TIMEOUT;

        emit GameJoined(gameId, msg.sender);
    }

    function reveal(uint256 gameId, Move move1, string calldata salt) external {
        Game storage game = games[gameId];
        require(!game.completed, "Game already completed");
        require(msg.sender == game.player1, "Only player 1 can reveal");
        require(game.player2 != address(0), "No opponent joined yet");
        require(keccak256(abi.encodePacked(move1, salt)) == game.commitment1, "Invalid reveal");

        game.completed = true;
        address winner;
        uint256 totalPool = game.wager * 2;

        if (move1 == game.move2) {
            // Draw: Refund both
            (bool s1, ) = payable(game.player1).call{value: game.wager}("");
            (bool s2, ) = payable(game.player2).call{value: game.wager}("");
            require(s1 && s2, "Refund failed");
            emit GameDraw(gameId);
        } else if (
            (move1 == Move.Rock && game.move2 == Move.Scissors) ||
            (move1 == Move.Paper && game.move2 == Move.Rock) ||
            (move1 == Move.Scissors && game.move2 == Move.Paper)
        ) {
            winner = game.player1;
            (bool s, ) = payable(game.player1).call{value: totalPool}("");
            require(s, "Payout failed");
            emit GameResolved(gameId, winner, totalPool);
        } else {
            winner = game.player2;
            (bool s, ) = payable(game.player2).call{value: totalPool}("");
            require(s, "Payout failed");
            emit GameResolved(gameId, winner, totalPool);
        }
    }

    /**
     * @dev Allows Player 2 to claim the total pool if Player 1 fails to reveal after the deadline.
     */
    function claimTimeout(uint256 gameId) external {
        Game storage game = games[gameId];
        require(!game.completed, "Game already completed");
        require(game.player2 != address(0), "No opponent joined");
        require(block.timestamp > game.revealDeadline, "Reveal deadline not reached yet");

        game.completed = true;
        uint256 totalPool = game.wager * 2;
        
        (bool s, ) = payable(game.player2).call{value: totalPool}("");
        require(s, "Timeout payout failed");

        emit GameTimedOut(gameId, game.player2);
    }

    // Fallback function to receive MON
    receive() external payable {}
}
