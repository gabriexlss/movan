import "express"

/*
Arquivo feito pro corno do Typescript deixar eu colocar o id na requisição
*/
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            userId: number;
            verificado: boolean;
        }
    }
}
