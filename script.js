/**
 * @name QlikBotNode
 * @author felipe.marinho@bridsolucoes.com.br
 * @description
 * Script that deal with all the bot actions and commands.
*/

// CONFIGURATIONS
//
const Telegraf = require('telegraf');
const Keyboard = require('telegraf-keyboard');
const MySQLSession = require('telegraf-session-mysql');

const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')

const {Wit, log} = require('node-wit');

const session = new MySQLSession({
  host: 'localhost',
  user: 'root',
  password: 'rootCAT@',
  database: 'db_agrobot'
});

const client = new Wit({
  accessToken: "VXK5PLSLRIHV3IK7HEVJIX4UL4AITILR"//,
  // logger: new log.Logger(log.DEBUG) // optional
});

const optionsKeyboard = {
	inline: true, // default
	duplicates: false, // default
	newline: false, // default
};


// const Extra = require('telegraf/extra');
// const Markup = require('telegraf/markup');

const acesso = require('./bpm.files/acesso');
const registro = require('./bpm.files/registro');
const tratativadedados = require('./bpm.files/tratativadedados');

// Util.js
const util = require('./util');

// Scenes/Fatos
const faturamento = require('./fatos.files/01 - faturamento');
const pedidos = require('./fatos.files/02 - pedidos');
const meta = require('./fatos.files/03 - meta');
const margem = require('./fatos.files/04 - margem');
const visitas = require('./fatos.files/05 - visitas');

// Scene Registration
const flow = new Stage()
flow.register(faturamento.cena);
flow.register(pedidos.cena);
flow.register(meta.cena);
flow.register(margem.cena);
flow.register(visitas.cena);

var config = require('./config.json');

const bot = new Telegraf("625703719:AAHaIikdtgF5P1IKXkntO80WxvN6AaMU1h0");

let engine = null;

let qvf = config.qvf;
//
// END CONFIGURATIONS

// MAIN
//
// Middleware for mysql session
bot.use(session.middleware());
// END Middleware for mysql session

// Flow middleware
bot.use(flow.middleware())
// END Flow middleware

bot.start((ctx) => {
	ctx.reply(`Seja bem vindo ${ctx.message.from.username}! O que me conta de bom?`);
});
//
// END MAIN

// ON PHOTO OR STICKER
//
bot.on(['sticker', 'photo'], (ctx) => {
	return ctx.reply('👍');
});
//
// END ON PHOTO OR STICKER

// ON MESSAGE
//
bot.on('message', async function (ctx) {

	// PARA CASOS DE USUÁRIO MANDAR "SAIR" NO CHAT	
	if(ctx.message.text.toLowerCase() === 'sair'){

		if(ctx.session){
			registro.desabilitarUsuario(ctx.message.from.username).then(async function(result){
				await ctx.reply("OK, seu acesso será removido.\nCaso necessite novamente entre em contato comigo.\nFoi muito bom conversar com você. 😄 Até mais.");
				ctx.session = null;
				
				// ctx.telegram.leaveChat(ctx.message.chat.id);
			});
		}else{
			await ctx.reply("OK, seu pedido é uma ordem!");
		}

	}else{ // END PARA CASOS DE USUÁRIO MANDAR "SAIR" NO CHAT

		if(ctx.message.from.username){

			ctx.session.username = ctx.message.from.username;

			acesso.usuarioRegistrado(ctx.message.from.username).then(async function(result){
				await ctx.reply('Verificando acesso...');
				await console.log(result);
				if(result.length > 0 && typeof result !== 'undefined'){ // Possui registro
					await ctx.reply('Possui registro.');
					if(result[0]['UsuarioAtivo']){ // Possui acesso e está ativo
						await ctx.reply("O seu registro está ativo!");

						if(ctx.message.text.toLowerCase() === '/ajuda'){ // ON AJUDA
							
							ctx.reply('Os comandos que podem ser utilizados por você são:');

						}else{

							client.message(ctx.message.text, {}).then((data) => {

								let fato = '';

								if((typeof data.entities.fato) !== 'undefined'){
									ctx.session.fato = data.entities.fato[0].value;
								}else{
									ctx.session.fato = undefined;
								}

								if((typeof data.entities.dimensao) !== 'undefined'){
									ctx.session.dimensao = data.entities.dimensao[0].value;
								}else{
									ctx.session.dimensao = undefined;
								}

								acesso.getAcessos(ctx.message.from.username).then(async function(nresult){

									console.log("nresult ae:");
									console.log(nresult);

									switch(ctx.session.fato) {
										case "faturamento":
											var app = acesso.criarApp(qvf.comercial, nresult, ctx);

											if(app){
												ctx.reply("Faturamento? Ta na mão...");
												
												ctx.session.app = app;

												ctx.scene.enter('faturamento');
											}

											break;
										case "pedidos":
											var app = acesso.criarApp(qvf.comercial, nresult, ctx);

											if(app){
												ctx.reply("Então você quer saber sobre os seus pedidos?");
												
												ctx.session.app = app;

												ctx.scene.enter('pedidos');
											}
											break;
										case "meta":
											var app = acesso.criarApp(qvf.comercial, nresult, ctx);

											if(app){
												ctx.reply("É metas que você quer? Então toma...");
												
												ctx.session.app = app;

												ctx.scene.enter('meta');
											}
											break;
										case "margem":
											var app = acesso.criarApp(qvf.comercial, nresult, ctx);

											if(app){
												ctx.reply("A margem te preocupa? Vamos ver.");
												
												ctx.session.app = app;

												ctx.scene.enter('margem');
											}
											break;
										case "visitas":
											var app = acesso.criarApp(qvf.forcadevendas, nresult, ctx);

											if(app){
												ctx.reply("Hoje parece que temos as seguintes visitas a serem realizadas:");
												
												ctx.session.app = app;

												ctx.scene.enter('visitas');
											}
											break;
										default:
											ctx.reply("Acho que não entendi sua solicitação 😞 Você pode consultar a /ajuda caso precise!");	
											break;
									}

								});

							})
							.catch(console.error);
						}


						// const keyboard = new Keyboard(optionsKeyboard);
						// keyboard
						// 	.add('Item 1', 'Item 2', 'Item 3') // first line
						//     .add('Item 10') // second line
						//     .remove('Item 2')
						//     .rename('Item 10', 'Item 2');
						// await ctx.reply('Keyboard', keyboard.draw());

					}else{ // Possui acesso e está inativo
						await ctx.reply(`Olá ${ctx.message.from.username}, seus dados já foram gravados. Favor, solicitar a liberação de dados ao Suporte Brid Soluções! 😉`);
					}
				}else{ // Não possui registro
					await ctx.reply('Não possui registro.');
					registro.registrarUsuario(ctx.message.from.username).then(async function(result){
						await ctx.reply(`Olá ${ctx.message.from.username}, seus dados foram gravados. Favor, solicitar a liberação de dados ao Suporte Brid Soluções! 😉`);
					});
				}
			});

		}else{

			await ctx.reply("Por favor, configurar um usuário para sua conta! Ele será necessário para realizar a liberação dos seus dados! 😉");

		}

	}

});

bot.action('baixar', async (ctx) => {
    // ctx.replyWithHTML(`Desculpe, essa funcionalidade não está completa.`)
    ctx.replyWithHTML(`Estou baixando, só um momento.`)
        .then(result => {
            ctx.telegram.sendDocument(ctx.session.chatId, { source: 'app/server/files/SIP - Synapse.pdf' });
        })
        .catch(e => console.log("Erro ao mostrar o /relatorio: ", e));
    await ctx.scene.leave();
});

//
// END ON MESSAGE

// /*************
//  * SALESFORCE
//  *************/
// // BUTTONS
// const keyboardSalesforce = Markup.inlineKeyboard([
// 	Markup.urlButton(config.text.viewDemo, 'https://webapps.qlik.com/salesforce/index.html'),
// 	Markup.callbackButton(config.text.salesforce.dashboard.button, 'salesforceDashboard'),
// 	Markup.callbackButton(config.text.salesforce.opportunities.button, 'salesforceOpportunities')
// 	// Markup.callbackButton('Chart', 'salesforceChart')
// ]);
// // COMMANDS - ACTIONS
// bot.command('salesforce', (ctx) => {
// 	try {
// 		console.log(`salesforce-main`, { route: `api/sense-bot/telegram` });
// 		ctx.reply(config.text.salesforce.welcome);
// 		ctx.replyWithPhoto({ url: 'https://webapps.qlik.com/img/2017_salesforce.png' });
// 		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardSalesforce));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::salesforce()` });
// 	}
// });
// bot.action('salesforceChart', (ctx) => {
// 	try {
// 		console.log(`salesforce-chart`, { route: `api/sense-bot/telegram` });
// 		ctx.replyWithPhoto({ url: 'http://sense-demo-staging.qlik.com:1337/133dab5d-8f56-4d40-b3e0-a6b401391bde/PAppmU' });
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::salesforceChart()` });
// 	}
// });
// bot.action('salesforceDashboard', (ctx) => {
// 	try {
// 		console.log(`salesforce-dashboard`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.salesforce);
// 		engine.kpiMulti([
// 			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} [Opportunity Amount])`,
// 			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
// 			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'New Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
// 			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'Existing Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
// 			`num(Sum({<[Opportunity Won/Lost] = {'WON'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count), '##%')`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.salesforce.dashboard.title}</b>
// 		${config.text.salesforce.dashboard.kpi1}: <b>${result[0][0].qText}</b>
// 		${config.text.salesforce.dashboard.kpi2}: <b>${result[1][0].qText}</b>
// 		${config.text.salesforce.dashboard.kpi3}: <b>${result[2][0].qText}</b>
// 		${config.text.salesforce.dashboard.kpi4}: <b>${result[3][0].qText}</b>
// 		${config.text.salesforce.dashboard.kpi5}: <b>${result[4][0].qText}</b>
// 			`, Extra.markup(keyboardSalesforce));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::saleforceDashboard()` });
// 	}
// });
// bot.action('salesforceOpportunities', (ctx) => {
// 	try {
// 		console.log(`salesforce-opportunities`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.salesforce);
// 		engine.kpiMulti([
// 			`num(Sum({<[Opportunity Triphase]={'OPEN'}>} [Opportunity Amount]),'$###,###,###')`,
// 			`num(Sum({<[Opportunity Triphase]={'OPEN'}>} Opportunity_Count),'###,###,###')`,
// 			`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
// 			`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
// 			`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
// 			`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
// 			`num(Sum({<[Opportunity Won/Lost] = {'WON'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}>} Opportunity_Count), '##%')`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.salesforce.opportunities.title}</b>
// 		${config.text.salesforce.opportunities.kpi1}: <b>${result[0][0].qText}</b>
// 		${config.text.salesforce.opportunities.kpi2}: <b>${result[1][0].qText}</b>
// 		${config.text.salesforce.opportunities.kpi3}: <b>${result[2][0].qText}</b>
// 		${config.text.salesforce.opportunities.kpi4}: <b>${result[3][0].qText}</b>
// 		${config.text.salesforce.opportunities.kpi5}: <b>${result[4][0].qText}</b>
// 		${config.text.salesforce.opportunities.kpi6}: <b>${result[5][0].qText}</b>
// 		${config.text.salesforce.opportunities.kpi7}: <b>${result[6][0].qText}</b>
// 			`, Extra.markup(keyboardSalesforce));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::salesforceOpportunities()` });
// 	}
// });

// /***************
//  * CIO DASHBOARD
//  **************/
// // BUTTONS
// const keyboardCio = Markup.inlineKeyboard([
// 	Markup.urlButton(config.text.viewDemo, 'https://webapps.qlik.com/CIO/index.html'),
// 	Markup.callbackButton(config.text.cio.management.button, 'cioManagement'),
// 	Markup.callbackButton(config.text.cio.customer.button, 'cioCustomerService')
// ]);
// // COMMANDS - ACTIONS
// bot.command('cio', (ctx) => {
// 	try {
// 		console.log(`cio-main`, { route: `api/sense-bot/telegram` });
// 		ctx.reply(config.text.cio.welcome);
// 		ctx.replyWithPhoto({ url: 'https://sense-demo-staging.qlik.com/appcontent/d0dd198f-138b-41d8-a099-5c5071bd6b33/CIO-desktop-development.jpg' });
// 		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardCio));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::cio()` });
// 	}
// });
// bot.action('cioManagement', (ctx) => {
// 	try {
// 		console.log(`cio-management`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.cio);
// 		engine.kpiMulti([
// 			`num(sum([Cost] * History* _CurrYTD),'#,##0')`,
// 			`num(sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD),'#,##0')`,
// 			`num((sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD))/(sum([Cost] * History* _CurrYTD)),'#,###.#0%')`,
// 			`num(avg({<HDStatus=, _CurrYTD={1}>}SLA),'##.##%')`,
// 			`num((avg({<HDStatus=, _CurrYTD={1}>}SLA))-.9970,'##.##%')`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.cio.management.title}</b>
// 		${config.text.cio.management.kpi1}: <b>${result[0][0].qText}</b>
// 		${config.text.cio.management.kpi2}: <b>${result[1][0].qText}</b>
// 		${config.text.cio.management.kpi3}: <b>${result[2][0].qText}</b>
// 		${config.text.cio.management.kpi4}: <b>${result[3][0].qText}</b>
// 		${config.text.cio.management.kpi5}: <b>99.70</b>
// 		${config.text.cio.management.kpi6}: <b>${result[4][0].qText}</b>
// 			`, Extra.markup(keyboardCio));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::cioManagement()` });
// 	}
// });
// bot.action('cioCustomerService', (ctx) => {
// 	try {
// 		console.log(`cio-customer-service`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.cio);
// 		engine.kpiMulti([
// 			`num(Avg({<HDStatus=, Year={$(=$(vMaxYear))}>}[Customer Grade]),'#,###.##')`,
// 			`num(Avg({<[Case Status]=, Year={$(=$(vMaxYear))}>}[Customer Grade])-3.75,'##.##')`,
// 			`num(sum({<HDStatus = {'Resolved'} >}ticketCounter),'#,##0')`,
// 			`num(sum({<HDStatus = {'Open', 'Pending'} >}ticketCounter),'#,##0')`,
// 			`num(((Date(Avg([resolution time]))-Floor(Avg([resolution time])))*(24*60))/60, '##.##')`,
// 			`num(((Date(0.08334)-Floor(0.08334))*(24*60))/60, '##.##')`,
// 			`num(((Date(0.08334)-Floor(0.08334))*(24*60))/60, '##.##')`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.cio.customer.title}</b>
// 		${config.text.cio.customer.kpi1}: <b>${result[0][0].qText}</b>
// 		${config.text.cio.customer.kpi2}: <b>3.75</b>
// 		${config.text.cio.customer.kpi3}: <b>${result[1][0].qText}</b>
// 		${config.text.cio.customer.kpi4}: <b>${result[2][0].qText}</b>
// 		${config.text.cio.customer.kpi5}: <b>${result[3][0].qText}</b>
// 		${config.text.cio.customer.kpi6}: <b>${result[4][0].qText}</b>
// 		${config.text.cio.customer.kpi7}: <b>${result[5][0].qText}</b>
// 		${config.text.cio.customer.kpi8}: <b>${result[6][0].qText}</b>
// 			`, Extra.markup(keyboardCio));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::cioCustomerService()` });
// 	}
// });

// /***************
//  * HELPDESK
//  **************/
// // BUTTONS
// const keyboardHelpdesk = Markup.inlineKeyboard([
// 	[
// 		Markup.urlButton('View Demo', 'https://demos.qlik.com/qliksense/HelpdeskManagement'),
// 		Markup.callbackButton(config.text.helpdesk.highPriorityCases.button, 'helpdeskHighPriorityCases')
// 	],
// 	[
// 		Markup.callbackButton(config.text.helpdesk.mediumPriorityCases.button, 'helpdeskMediumPriorityCases'),
// 		Markup.callbackButton(config.text.helpdesk.lowPriorityCases.button, 'helpdeskLowPriorityCases')
// 	]
// ]);
// // COMMANDS - ACTIONS
// bot.command('helpdesk', (ctx) => {
// 	try {
// 		console.log(`helpdesk-main`, { route: `api/sense-bot/telegram` });
// 		ctx.reply(config.text.helpdesk.welcome);
// 		ctx.replyWithPhoto({ url: 'https://sense-demo-staging.qlik.com/appcontent/133dab5d-8f56-4d40-b3e0-a6b401391bde/helpdesk_management.jpg' });
// 		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardHelpdesk));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::helpdesk()` });
// 	}
// });
// bot.action('helpdeskHighPriorityCases', (ctx) => {
// 	try {
// 		console.log(`helpdeskHighPriorityCases`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.helpdesk);
// 		engine.kpiMulti([
// 			`Count( {$<Priority={'High'}, Status -={'Closed'} >} Distinct %CaseId )`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.helpdesk.highPriorityCases.title}</b>
// 		${config.text.helpdesk.highPriorityCases.kpi1} <b>${result[0][0].qText}</b> ${config.text.helpdesk.highPriorityCases.kpi2}
// 			`, Extra.markup(keyboardHelpdesk));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::helpdeskHighPriorityCases()` });
// 	}
// });
// bot.action('helpdeskMediumPriorityCases', (ctx) => {
// 	try {
// 		console.log(`helpdeskMediumPriorityCases`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.helpdesk);
// 		engine.kpiMulti([
// 			`Count( {$<Priority={'Medium'}, Status -={'Closed'} >} Distinct %CaseId )`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.helpdesk.mediumPriorityCases.title}</b>
// 		${config.text.helpdesk.mediumPriorityCases.kpi1} <b>${result[0][0].qText}</b> ${config.text.helpdesk.mediumPriorityCases.kpi2}
// 			`, Extra.markup(keyboardHelpdesk));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::helpdeskMediumPriorityCases()` });
// 	}
// });
// bot.action('helpdeskLowPriorityCases', (ctx) => {
// 	try {
// 		console.log(`helpdeskLowPriorityCases`, { route: `api/sense-bot/telegram` });
// 		engine = new site.Enigma(qvf.helpdesk);
// 		engine.kpiMulti([
// 			`Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )`
// 		])
// 			.then(result => {
// 				ctx.replyWithHTML(`
// 		<b>${config.text.helpdesk.lowPriorityCases.title}</b>
// 		${config.text.helpdesk.lowPriorityCases.kpi1} <b>${result[0][0].qText}</b> ${config.text.helpdesk.lowPriorityCases.kpi2}
// 			`, Extra.markup(keyboardHelpdesk));
// 			})
// 			.catch(error => ctx.reply(`Error: ${error}`));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::helpdeskLowPriorityCases()` });
// 	}
// });

/***************
 * LANGUAGE SELECTOR
 **************/
// BUTTONS
// const keyboardLang = Markup.inlineKeyboard([
// 	[
// 		Markup.callbackButton(config.text.en.title, 'langEn'),
// 		Markup.callbackButton(config.text.el.title, 'langGr')
// 	]
// ]);
// // COMMANDS - ACTIONS
// bot.command('lang', (ctx) => {
// 	try {
// 		console.log(`lang-main`, { route: `api/sense-bot/telegram` });
// 		ctx.reply("Select Language");
// 		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardLang));
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::lang()` });
// 	}
// });
// bot.action('langEn', (ctx) => {
// 	try {
// 		lang = 'en';
// 		ctx.reply(config.text.en.setLang);
// 		console.log(`lang-en`, { route: `api/sense-bot/telegram` });
// 	}
// 	catch (error) {
// 		console.log(`error: ${error}`, { route: `api/sense-bot/telegram::langEn()` });
// 	}
// });

bot.startPolling();