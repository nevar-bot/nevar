import i18next from "i18next";
import i18nextBackend from "i18next-fs-backend";
import * as path from "path";
import fs from "fs/promises";

export class Languages {
	public constructor(){};

	private async loadNamespaces(basePath: string): Promise<any>{
		const namespaces: Set<string> = new Set<string>();
		const languages: string[] = [];

		async function processDir(languagePath: string, parentNamespace: string = ""): Promise<void> {
			const files: string[] = await fs.readdir(languagePath);

			for (const file of files) {
				const filePath: string = path.join(languagePath, file);
				const stats: any = await fs.stat(filePath);

				if (stats.isDirectory()) {
					await processDir(filePath, parentNamespace);
				} else if (path.extname(file) === '.json') {
					const namespace: string = path.join(parentNamespace, path.relative(basePath, languagePath), path.parse(file).name);
					namespaces.add(namespace.substring(3).replaceAll("\\", "/"));
				}
			}
		}

		const languageDirs: string[] = await fs.readdir(basePath);
		for (const languageDir of languageDirs) {
			const languagePath: string = path.join(basePath, languageDir);
			const stats: any = await fs.stat(languagePath);

			if (stats.isDirectory()) {
				await processDir(languagePath);
				languages.push(languageDir);
			}
		}

		return { namespaces: Array.from(namespaces), languages };
	}

	public async load(): Promise<any> {
		const options = {
			jsonIndent: 2,
			loadPath: path.resolve(process.cwd(), "./locales/{{lng}}//{{ns}}.json"),
		};

		const { namespaces, languages } = await this.loadNamespaces(path.resolve( process.cwd(), './locales'));

		i18next.use(i18nextBackend);

		await i18next.init({
			backend: options,
			debug: false,
			fallbackLng: "de",
			returnObjects: true,
			initImmediate: false,
			interpolation: {
				escapeValue: false,
			},
			load: "all",
			ns: namespaces,
			preload: languages,
		});

		return new Map(languages.map((item: string) => [item, i18next.getFixedT(item)]));
	}
}