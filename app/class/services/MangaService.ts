class MangaService {

    private useManga: any;

    constructor(useManga: any) {
        this.useManga = useManga;
    }

    avaliaManga(idManga: number, nota: string): void {
        let notaConvertida = parseInt(nota);

        try {
            this.useManga.adicionaNotaAoManga(idManga, notaConvertida);
        } catch (error) {
            throw error;
        }
    }
}

export default MangaService;