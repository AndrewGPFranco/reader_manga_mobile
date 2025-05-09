class MangaService {

    private readonly useManga: any;

    constructor(useManga: any) {
        this.useManga = useManga;
    }

    avaliaManga(idManga: number, nota: string | null): void {
        let notaConvertida: number | null = null;

        if(nota != null)
            notaConvertida = parseInt(nota)

        try {
            this.useManga.adicionaNotaAoManga(idManga, notaConvertida);
        } catch (error) {
            throw error;
        }
    }
}

export default MangaService;