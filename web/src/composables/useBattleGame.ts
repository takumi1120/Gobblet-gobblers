import { computed, onBeforeUnmount, ref, type Ref } from "vue";
import type {
    Player,
    PieceSize,
    Piece,
    Cell,
    SelectedSource,
    Line,
} from "../types/battle.types";

type Params = {
    player1Name: Ref<string>;
    player2Name: Ref<string>;
    onWin?: (winner: Player) => void | Promise<void>;
    cpuPlayer?: Player | null;
    cpuMoveDelayMs?: number;
};

type MoveSource = Exclude<SelectedSource, null>;

type SimulatedState = {
    board: Cell[][];
    reserveP1: Piece[];
    reserveP2: Piece[];
};

type CandidateMove = {
    source: MoveSource;
    row: number;
    col: number;
    piece: Piece;
};

const SIZE_LABEL: Record<PieceSize, string> = {
    1: "S",
    2: "M",
    3: "L",
};

const WIN_LINES: Line[] = [
    [
        [0, 0],
        [0, 1],
        [0, 2],
    ],
    [
        [1, 0],
        [1, 1],
        [1, 2],
    ],
    [
        [2, 0],
        [2, 1],
        [2, 2],
    ],
    [
        [0, 0],
        [1, 0],
        [2, 0],
    ],
    [
        [0, 1],
        [1, 1],
        [2, 1],
    ],
    [
        [0, 2],
        [1, 2],
        [2, 2],
    ],
    [
        [0, 0],
        [1, 1],
        [2, 2],
    ],
    [
        [0, 2],
        [1, 1],
        [2, 0],
    ],
];

function createPlayerPieces(owner: Player): Piece[] {
    return [
        { id: `P${owner}-S1`, owner, size: 1 },
        { id: `P${owner}-S2`, owner, size: 1 },
        { id: `P${owner}-M1`, owner, size: 2 },
        { id: `P${owner}-M2`, owner, size: 2 },
        { id: `P${owner}-L1`, owner, size: 3 },
        { id: `P${owner}-L2`, owner, size: 3 },
    ];
}

function createEmptyBoard(): Cell[][] {
    return Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => [])
    );
}

function cloneBoard(source: Cell[][]): Cell[][] {
    return source.map((row) => row.map((cell) => [...cell]));
}

function cloneState(state: SimulatedState): SimulatedState {
    return {
        board: cloneBoard(state.board),
        reserveP1: [...state.reserveP1],
        reserveP2: [...state.reserveP2],
    };
}

export function useBattleGame(params: Params) {
    const board = ref<Cell[][]>(createEmptyBoard());
    const reserveP1 = ref<Piece[]>(createPlayerPieces(1));
    const reserveP2 = ref<Piece[]>(createPlayerPieces(2));

    const currentPlayer = ref<Player>(1);
    const winner = ref<Player | null>(null);
    const selectedSource = ref<SelectedSource>(null);
    const winningLine = ref<Line | null>(null);
    const message = ref(`${params.player1Name.value} の手番です`);

    const cpuPlayer = params.cpuPlayer ?? null;
    const cpuMoveDelayMs = params.cpuMoveDelayMs ?? 700;
    const cpuThinking = ref(false);

    let cpuTimer: number | null = null;

    function clearCpuTimer() {
        if (cpuTimer !== null) {
            window.clearTimeout(cpuTimer);
            cpuTimer = null;
        }
        cpuThinking.value = false;
    }

    function playerDisplayName(player: Player): string {
        return player === 1 ? params.player1Name.value : params.player2Name.value;
    }

    function getTopPiece(cell: Cell): Piece | null {
        if (cell.length === 0) return null;
        return cell[cell.length - 1];
    }

    function getTopPieceFromBoard(targetBoard: Cell[][], row: number, col: number): Piece | null {
        const cell = targetBoard[row]?.[col];
        if (!cell || cell.length === 0) return null;
        return cell[cell.length - 1];
    }

    function visibleOwner(row: number, col: number): Player | null {
        const top = getTopPiece(board.value[row][col]);
        return top ? top.owner : null;
    }

    function visibleOwnerOnBoard(targetBoard: Cell[][], row: number, col: number): Player | null {
        const top = getTopPieceFromBoard(targetBoard, row, col);
        return top ? top.owner : null;
    }

    function canPlaceOnCell(piece: Piece, row: number, col: number): boolean {
        const top = getTopPiece(board.value[row][col]);
        if (!top) return true;
        return piece.size > top.size;
    }

    function canPlaceOnBoard(
        targetBoard: Cell[][],
        piece: Piece,
        row: number,
        col: number
    ): boolean {
        const top = getTopPieceFromBoard(targetBoard, row, col);
        if (!top) return true;
        return piece.size > top.size;
    }

    function currentReserveList(): Piece[] {
        return currentPlayer.value === 1 ? reserveP1.value : reserveP2.value;
    }

    function reserveListForPlayer(player: Player): Piece[] {
        return player === 1 ? reserveP1.value : reserveP2.value;
    }

    function reserveListFromState(state: SimulatedState, player: Player): Piece[] {
        return player === 1 ? state.reserveP1 : state.reserveP2;
    }

    function getSelectedPiece(): Piece | null {
        if (!selectedSource.value) return null;

        if (selectedSource.value.type === "reserve") {
            return currentReserveList().find((p) => p.id === selectedSource.value?.pieceId) ?? null;
        }

        const { row, col, pieceId } = selectedSource.value;
        const top = getTopPiece(board.value[row][col]);

        if (!top) return null;
        if (top.id !== pieceId) return null;

        return top;
    }

    function getPieceFromSource(source: MoveSource, player: Player): Piece | null {
        if (source.type === "reserve") {
            return reserveListForPlayer(player).find((p) => p.id === source.pieceId) ?? null;
        }

        const top = getTopPiece(board.value[source.row][source.col]);
        if (!top) return null;
        if (top.id !== source.pieceId) return null;
        if (top.owner !== player) return null;

        return top;
    }

    function getPieceFromSourceInState(
        state: SimulatedState,
        player: Player,
        source: MoveSource
    ): Piece | null {
        if (source.type === "reserve") {
            return reserveListFromState(state, player).find((p) => p.id === source.pieceId) ?? null;
        }

        const top = getTopPieceFromBoard(state.board, source.row, source.col);
        if (!top) return null;
        if (top.id !== source.pieceId) return null;
        if (top.owner !== player) return null;

        return top;
    }

    const selectedPiece = computed(() => getSelectedPiece());

    function isCpuTurn(): boolean {
        return cpuPlayer !== null && currentPlayer.value === cpuPlayer && winner.value === null;
    }

    function selectReservePiece(pieceId: string) {
        if (winner.value) return;

        if (isCpuTurn()) {
            message.value = `${playerDisplayName(currentPlayer.value)} が考えています...`;
            return;
        }

        if (currentPlayer.value === 1 && !reserveP1.value.some((p) => p.id === pieceId)) return;
        if (currentPlayer.value === 2 && !reserveP2.value.some((p) => p.id === pieceId)) return;

        selectedSource.value = { type: "reserve", pieceId };

        const piece = getSelectedPiece();
        if (!piece) return;

        message.value = `${playerDisplayName(currentPlayer.value)}：${SIZE_LABEL[piece.size]} を置くマスを選んでください`;
    }

    function checkWinner(): { winner: Player | null; line: Line | null } {
        for (const line of WIN_LINES) {
            const owners = line.map(([r, c]) => visibleOwner(r, c));
            if (owners[0] && owners.every((owner) => owner === owners[0])) {
                return {
                    winner: owners[0],
                    line,
                };
            }
        }

        return {
            winner: null,
            line: null,
        };
    }

    function checkWinnerOnBoard(targetBoard: Cell[][]): { winner: Player | null; line: Line | null } {
        for (const line of WIN_LINES) {
            const owners = line.map(([r, c]) => visibleOwnerOnBoard(targetBoard, r, c));
            if (owners[0] && owners.every((owner) => owner === owners[0])) {
                return {
                    winner: owners[0],
                    line,
                };
            }
        }

        return {
            winner: null,
            line: null,
        };
    }

    function isSelectedReservePiece(pieceId: string): boolean {
        return (
            selectedSource.value?.type === "reserve" &&
            selectedSource.value.pieceId === pieceId
        );
    }

    function isSelectedBoardPiece(row: number, col: number): boolean {
        return (
            selectedSource.value?.type === "board" &&
            selectedSource.value.row === row &&
            selectedSource.value.col === col
        );
    }

    function isWinningCell(row: number, col: number): boolean {
        if (!winningLine.value) return false;
        return winningLine.value.some(([r, c]) => r === row && c === col);
    }

    function isPlayableCell(row: number, col: number): boolean {
        const piece = selectedPiece.value;
        if (!piece || winner.value || isCpuTurn()) return false;

        if (
            selectedSource.value?.type === "board" &&
            selectedSource.value.row === row &&
            selectedSource.value.col === col
        ) {
            return false;
        }

        return canPlaceOnCell(piece, row, col);
    }

    function reserveText(piece: Piece): string {
        return `${playerDisplayName(piece.owner)} ${SIZE_LABEL[piece.size]}`;
    }

    function topPiece(row: number, col: number): Piece | null {
        return getTopPiece(board.value[row][col]);
    }

    function boardPieceAt(index: number): Piece | null {
        return topPiece(Math.floor(index / 3), index % 3);
    }

    function finishTurnOrWin() {
        const result = checkWinner();

        if (result.winner) {
            winner.value = result.winner;
            winningLine.value = result.line;
            cpuThinking.value = false;
            message.value = `${playerDisplayName(result.winner)} の勝ち！`;

            if (params.onWin) {
                void params.onWin(result.winner);
            }
            return;
        }

        currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
        message.value = `${playerDisplayName(currentPlayer.value)} の手番です`;

        if (cpuPlayer !== null && currentPlayer.value === cpuPlayer) {
            scheduleCpuTurn();
        }
    }

    function executeMove(source: MoveSource, row: number, col: number) {
        const piece = getPieceFromSource(source, currentPlayer.value);
        if (!piece) {
            selectedSource.value = null;
            message.value = "その駒は動かせません";
            return;
        }

        if (!canPlaceOnCell(piece, row, col)) {
            message.value = "そのマスには置けません";
            return;
        }

        clearCpuTimer();

        if (source.type === "reserve") {
            const list = currentReserveList();
            const index = list.findIndex((p) => p.id === piece.id);
            if (index === -1) return;
            list.splice(index, 1);
            board.value[row][col].push(piece);
        } else {
            const fromCell = board.value[source.row][source.col];
            const top = getTopPiece(fromCell);

            if (!top || top.id !== piece.id) {
                selectedSource.value = null;
                message.value = "その駒は動かせません";
                return;
            }

            fromCell.pop();
            board.value[row][col].push(piece);
        }

        selectedSource.value = null;
        finishTurnOrWin();
    }

    function moveSelectedPieceTo(row: number, col: number) {
        if (!selectedSource.value) return;
        executeMove(selectedSource.value, row, col);
    }

    function createCurrentState(): SimulatedState {
        return {
            board: cloneBoard(board.value),
            reserveP1: [...reserveP1.value],
            reserveP2: [...reserveP2.value],
        };
    }

    function simulateMove(
        state: SimulatedState,
        player: Player,
        move: CandidateMove
    ): SimulatedState {
        const next = cloneState(state);
        const piece = getPieceFromSourceInState(next, player, move.source);

        if (!piece) return next;

        if (move.source.type === "reserve") {
            const list = reserveListFromState(next, player);
            const index = list.findIndex((p) => p.id === piece.id);
            if (index === -1) return next;
            list.splice(index, 1);
            next.board[move.row][move.col].push(piece);
            return next;
        }

        const fromCell = next.board[move.source.row][move.source.col];
        const top = getTopPiece(fromCell);

        if (!top || top.id !== piece.id) return next;

        fromCell.pop();
        next.board[move.row][move.col].push(piece);

        return next;
    }

    function listLegalMoves(state: SimulatedState, player: Player): CandidateMove[] {
        const moves: CandidateMove[] = [];
        const reserve = reserveListFromState(state, player);

        for (const piece of reserve) {
            for (let row = 0; row < 3; row += 1) {
                for (let col = 0; col < 3; col += 1) {
                    if (canPlaceOnBoard(state.board, piece, row, col)) {
                        moves.push({
                            source: { type: "reserve", pieceId: piece.id },
                            row,
                            col,
                            piece,
                        });
                    }
                }
            }
        }

        for (let fromRow = 0; fromRow < 3; fromRow += 1) {
            for (let fromCol = 0; fromCol < 3; fromCol += 1) {
                const top = getTopPieceFromBoard(state.board, fromRow, fromCol);
                if (!top || top.owner !== player) continue;

                for (let toRow = 0; toRow < 3; toRow += 1) {
                    for (let toCol = 0; toCol < 3; toCol += 1) {
                        if (fromRow === toRow && fromCol === toCol) continue;
                        if (!canPlaceOnBoard(state.board, top, toRow, toCol)) continue;

                        moves.push({
                            source: {
                                type: "board",
                                row: fromRow,
                                col: fromCol,
                                pieceId: top.id,
                            },
                            row: toRow,
                            col: toCol,
                            piece: top,
                        });
                    }
                }
            }
        }

        return moves;
    }

    function countImmediateWinningReplies(state: SimulatedState, player: Player): number {
        const legalMoves = listLegalMoves(state, player);
        let count = 0;

        for (const move of legalMoves) {
            const next = simulateMove(state, player, move);
            const result = checkWinnerOnBoard(next.board);
            if (result.winner === player) {
                count += 1;
            }
        }

        return count;
    }

    function cellPriority(row: number, col: number): number {
        if (row === 1 && col === 1) return 30;

        const isCorner =
            (row === 0 && col === 0) ||
            (row === 0 && col === 2) ||
            (row === 2 && col === 0) ||
            (row === 2 && col === 2);

        if (isCorner) return 22;
        return 14;
    }

    function linePotentialScore(targetBoard: Cell[][], player: Player): number {
        const opponent: Player = player === 1 ? 2 : 1;
        let score = 0;

        for (const line of WIN_LINES) {
            const owners = line.map(([r, c]) => visibleOwnerOnBoard(targetBoard, r, c));
            const ownCount = owners.filter((owner) => owner === player).length;
            const oppCount = owners.filter((owner) => owner === opponent).length;

            if (oppCount === 0) {
                score += ownCount * 6;
                if (ownCount === 2) score += 14;
            }

            if (ownCount === 0 && oppCount === 2) {
                score -= 10;
            }
        }

        return score;
    }

    function evaluateMove(state: SimulatedState, player: Player, move: CandidateMove): number {
        const targetTop = getTopPieceFromBoard(state.board, move.row, move.col);
        const next = simulateMove(state, player, move);

        let score = 0;
        score += cellPriority(move.row, move.col);
        score += move.piece.size * 5;
        score += move.source.type === "reserve" ? 3 : 1;

        if (targetTop && targetTop.owner !== player) {
            score += 8 + targetTop.size;
        }

        score += linePotentialScore(next.board, player);

        return score;
    }

    function chooseCpuMove(): CandidateMove | null {
        if (cpuPlayer === null) return null;

        const player = cpuPlayer;
        const opponent: Player = player === 1 ? 2 : 1;
        const state = createCurrentState();
        const legalMoves = listLegalMoves(state, player);

        if (legalMoves.length === 0) return null;

        let winningMove: CandidateMove | null = null;
        let winningScore = -Infinity;

        for (const move of legalMoves) {
            const next = simulateMove(state, player, move);
            const result = checkWinnerOnBoard(next.board);

            if (result.winner === player) {
                const score = evaluateMove(state, player, move);
                if (score > winningScore) {
                    winningScore = score;
                    winningMove = move;
                }
            }
        }

        if (winningMove) return winningMove;

        const opponentThreatCountNow = countImmediateWinningReplies(state, opponent);

        let bestSafeMove: CandidateMove | null = null;
        let bestSafeScore = -Infinity;

        let bestBlockMove: CandidateMove | null = null;
        let bestBlockRemainingThreats = Infinity;
        let bestBlockScore = -Infinity;

        let bestFallbackMove: CandidateMove | null = null;
        let bestFallbackScore = -Infinity;

        for (const move of legalMoves) {
            const next = simulateMove(state, player, move);
            const result = checkWinnerOnBoard(next.board);
            const score = evaluateMove(state, player, move);

            if (score > bestFallbackScore) {
                bestFallbackScore = score;
                bestFallbackMove = move;
            }

            if (result.winner === opponent) {
                continue;
            }

            const remainingThreats = countImmediateWinningReplies(next, opponent);

            if (opponentThreatCountNow > 0) {
                if (
                    remainingThreats < bestBlockRemainingThreats ||
                    (remainingThreats === bestBlockRemainingThreats && score > bestBlockScore)
                ) {
                    bestBlockRemainingThreats = remainingThreats;
                    bestBlockScore = score;
                    bestBlockMove = move;
                }
                continue;
            }

            if (remainingThreats === 0 && score > bestSafeScore) {
                bestSafeScore = score;
                bestSafeMove = move;
            }
        }

        if (opponentThreatCountNow > 0 && bestBlockMove) {
            return bestBlockMove;
        }

        if (bestSafeMove) {
            return bestSafeMove;
        }

        return bestFallbackMove;
    }

    function scheduleCpuTurn() {
        if (cpuPlayer === null) return;
        if (winner.value) return;
        if (currentPlayer.value !== cpuPlayer) return;

        clearCpuTimer();
        cpuThinking.value = true;
        message.value = `${playerDisplayName(cpuPlayer)} が考えています...`;

        cpuTimer = window.setTimeout(() => {
            cpuTimer = null;
            cpuThinking.value = false;

            if (winner.value) return;
            if (currentPlayer.value !== cpuPlayer) return;

            const move = chooseCpuMove();
            if (!move) return;

            executeMove(move.source, move.row, move.col);
        }, cpuMoveDelayMs);
    }

    function handleCellClick(row: number, col: number) {
        if (winner.value) return;

        if (isCpuTurn()) {
            message.value = `${playerDisplayName(currentPlayer.value)} が考えています...`;
            return;
        }

        const cell = board.value[row][col];
        const top = getTopPiece(cell);
        const piece = getSelectedPiece();

        if (!piece) {
            if (top && top.owner === currentPlayer.value) {
                selectedSource.value = {
                    type: "board",
                    row,
                    col,
                    pieceId: top.id,
                };
                message.value = `${playerDisplayName(currentPlayer.value)}：${SIZE_LABEL[top.size]} を移動する先を選んでください`;
                return;
            }

            message.value = "自分の駒を選んでください";
            return;
        }

        if (
            selectedSource.value?.type === "board" &&
            selectedSource.value.row === row &&
            selectedSource.value.col === col
        ) {
            selectedSource.value = null;
            message.value = `${playerDisplayName(currentPlayer.value)} の手番です`;
            return;
        }

        if (!canPlaceOnCell(piece, row, col)) {
            message.value = "そのマスには置けません";
            return;
        }

        moveSelectedPieceTo(row, col);
    }

    function resetGame() {
        clearCpuTimer();
        board.value = createEmptyBoard();
        reserveP1.value = createPlayerPieces(1);
        reserveP2.value = createPlayerPieces(2);
        currentPlayer.value = 1;
        winner.value = null;
        selectedSource.value = null;
        winningLine.value = null;
        message.value = `${params.player1Name.value} の手番です`;

        if (cpuPlayer === 1) {
            scheduleCpuTurn();
        }
    }

    onBeforeUnmount(() => {
        clearCpuTimer();
    });

    return {
        board,
        reserveP1,
        reserveP2,
        currentPlayer,
        winner,
        selectedSource,
        winningLine,
        message,
        selectedPiece,
        cpuThinking,

        playerDisplayName,
        selectReservePiece,
        handleCellClick,
        resetGame,
        isSelectedReservePiece,
        isSelectedBoardPiece,
        isWinningCell,
        isPlayableCell,
        reserveText,
        topPiece,
        boardPieceAt,
    };
}