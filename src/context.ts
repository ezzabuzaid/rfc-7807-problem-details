export interface HttpContext {
	req: { url: string };
	res: { status: number };
}
