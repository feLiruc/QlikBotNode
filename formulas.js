Enigma = require("./Enigma");

module.exports = {
	executaFormula: (ctx) => {
		engine = new Enigma(ctx.session.app);
		engine.kpiMulti([
			`Num(($(eFaturamento))/pow(1000,floor(log10(fabs($(eFaturamento)))/3)),'#.##0,00') & pick(floor(log10(fabs($(eFaturamento)))/3)+1,'',' mil',' mi',' bi')`
		])
		.then(result => {
			ctx.replyWithHTML(`
		<b>COMERCIAL</b>
FATURAMENTO: <b>${result[0][0].qText}</b>
`);
		})
		.catch(error => ctx.reply(`Error: ${error}`));
	},
	executaFormulaDimensao: async (ctx) => {
		engine = new Enigma(ctx.session.app);

		var dimensao = ctx.session.dimensao;

		engine.getHyperCube(
			[ctx.session.dimensao],
			[`$(eFaturamento)`],
			10
		)
		.then((results) => {
			if( results.length > 1 && typeof results[0][1]['qText'] != undefined){
				resposta = `Este é o(s) seu(s) ${ctx.session.cenaAtual} por ${ctx.session.dimensao}:
				`;
				for (var i = 0; i < results.length; i++) {
					resposta += `
<b>${results[i][0]['qText']}</b>: ${results[i][1]['qText']}
`;
				}
				ctx.replyWithHTML(resposta);
				ctx.session.dimensao = undefined;
			}else{
				ctx.reply("Hmmmm, acho que não entendi direito... podemos tentar novamente?");
				ctx.session.dimensao = undefined;
			}
		})
		.catch(error => ctx.reply(`Error: ${error}`));
	},
}