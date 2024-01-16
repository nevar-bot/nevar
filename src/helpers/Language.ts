import i18next from "i18next";
import i18nextBackend from "i18next-fs-backend";
import * as path from "path";
import fs from "fs/promises";


/**
async function walkDirectory(dir: any, namespaces: any = [], folderName: string = ""): Promise<any> {
	const files: string[] = fs.readdirSync(dir);

	const languages: any[] = [];
	for (const file of files) {
		const stat: any = await fs.statSync(path.join(dir, file));
		if (stat.isDirectory()) {
			const isLanguage: any = RegExp(/^[a-z]{2}(-[A-Z]{2})?$/).exec(file);
			if (isLanguage) languages.push(file);

			const folder: any = await walkDirectory(
				path.join(dir, file),
				namespaces,
				isLanguage ? "" : file + "/",
			);


			namespaces = folder.namespaces;

			//console.log(path.join(dir, file))
			//console.log(isLanguage ? "" : file + "/");
			//console.log(namespaces);
		} else {
			namespaces.push(folderName + file.replace(".json", ""));
		}
	}

	return { namespaces: [...new Set(namespaces)], languages };
}
*/

async function loadNamespaces(basePath: string): Promise<any> {
	const namespaces = new Set<string>();
	const languages: string[] = [];

	async function processDir(languagePath: string, parentNamespace: string = '') {
		const files = await fs.readdir(languagePath);

		for (const file of files) {
			const filePath = path.join(languagePath, file);
			const stats = await fs.stat(filePath);

			if (stats.isDirectory()) {
				await processDir(filePath, parentNamespace);
			} else if (path.extname(file) === '.json') {
				const namespace = path.join(parentNamespace, path.relative(basePath, languagePath), path.parse(file).name);
				namespaces.add(namespace.substring(3).replaceAll("\\", "/"));
			}
		}
	}

	const languageDirs = await fs.readdir(basePath);
	for (const languageDir of languageDirs) {
		const languagePath = path.join(basePath, languageDir);
		const stats = await fs.stat(languagePath);

		if (stats.isDirectory()) {
			await processDir(languagePath);
			languages.push(languageDir);
		}
	}

	return { namespaces: Array.from(namespaces), languages };
}




export async function languages() {
	const options = {
		jsonIndent: 2,
		loadPath: path.resolve(__dirname, "../../locales/{{lng}}//{{ns}}.json"),
	};

	const { namespaces, languages } = await loadNamespaces(path.resolve(__dirname, '../../locales'));
	console.log(namespaces);

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
