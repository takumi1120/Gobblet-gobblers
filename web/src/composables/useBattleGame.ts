import { computed, ref, type Ref } from "vue";
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
};

const SIZE_LABEL: Record<PieceSize, string> = {
    1: "S",
    2: "M",
    3: "L",
};

const WIN_LINES: Line[] = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
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

export function useBattleGame(params: Params) {
    const board = ref<Cell[][]>(createEmptyBoard());
    const reserveP1 = ref<Piece[]>(createPlayerPieces(1));
    const reserveP2 = ref<Piece[]>(createPlayerPieces(2));

    const currentPlayer = ref<Player>(1);
    const winner = ref<Player | null>(null);
    const selectedSource = ref<SelectedSource>(null);
    const winningLine = ref<Line | null>(null);
    const message = ref(`${params.player1Name.value} の手番です`);

    function playerDisplayName(player: Player): string {
        return player === 1 ? params.player1Name.value : params.player2Name.value;
    }

    function getTopPiece(cell: Cell): Piece | null {
        if (cell.length === 0) return null;
        return cell[cell.length - 1];
    }

    function visibleOwner(row: number, col: number): Player | null {
        const top = getTopPiece(board.value[row][col]);
        return top ? top.owner : null;
    }

    function canPlaceOnCell(piece: Piece, row: number, col: number): boolean {
        const top = getTopPiece(board.value[row][col]);
        if (!top) return true;
        return piece.size > top.size;
    }

    function currentReserveList(): Piece[] {
        return currentPlayer.value === 1 ? reserveP1.value : reserveP2.value;
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

    const selectedPiece = computed(() => getSelectedPiece());

    function selectReservePiece(pieceId: string) {
        if (winner.value) return;
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
        if (!piece || winner.value) return false;

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

    function moveSelectedPieceTo(row: number, col: number) {
        const piece = getSelectedPiece();
        if (!piece || !selectedSource.value) return;

        if (selectedSource.value.type === "reserve") {
            const list = currentReserveList();
            const index = list.findIndex((p) => p.id === piece.id);
            if (index === -1) return;
            list.splice(index, 1);
            board.value[row][col].push(piece);
        } else {
            const fromCell = board.value[selectedSource.value.row][selectedSource.value.col];
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

        const result = checkWinner();
        if (result.winner) {
            winner.value = result.winner;
            winningLine.value = result.line;
            message.value = `${playerDisplayName(result.winner)} の勝ち！`;

            if (params.onWin) {
                void params.onWin(result.winner);
            }
            return;
        }

        currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
        message.value = `${playerDisplayName(currentPlayer.value)} の手番です`;
    }

    function handleCellClick(row: number, col: number) {
        if (winner.value) return;

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
        board.value = createEmptyBoard();
        reserveP1.value = createPlayerPieces(1);
        reserveP2.value = createPlayerPieces(2);
        currentPlayer.value = 1;
        winner.value = null;
        selectedSource.value = null;
        winningLine.value = null;
        message.value = `${params.player1Name.value} の手番です`;
    }

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