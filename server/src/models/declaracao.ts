import "express"

/*
Arquivo feito pro corno do typescript deixar eu colocar o id na requisição
*/
declare module "express-serve-static-core" {
    interface Request {
        userId?: number;
    }
}