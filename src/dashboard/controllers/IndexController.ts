export default {
    getIndex(req: any, res: any): void {
        res.status(301).redirect("/dashboard");
    },
}