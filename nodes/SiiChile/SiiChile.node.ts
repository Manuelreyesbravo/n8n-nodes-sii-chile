import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	NodeOperationError,
} from 'n8n-workflow';

export class SiiChile implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SII Chile',
		name: 'siiChile',
		icon: 'file:sii.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Facturación Electrónica Chile - Emitir Boletas, Facturas, RUT, UF, UTM',
		defaults: {
			name: 'SII Chile',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'siiChileApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Recurso',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Emitir DTE', value: 'emitir', description: 'Boletas y Facturas al SII' },
					{ name: 'RUT', value: 'rut', description: 'Validar, formatear, calcular' },
					{ name: 'Indicadores', value: 'indicadores', description: 'UF, UTM, Dólar, Euro' },
				],
				default: 'rut',
			},
			{
				displayName: 'Operación',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['emitir'] } },
				options: [
					{ name: 'Emitir Boleta', value: 'emitirBoleta', action: 'Emitir boleta electrónica' },
					{ name: 'Emitir Factura', value: 'emitirFactura', action: 'Emitir factura electrónica' },
				],
				default: 'emitirBoleta',
			},
			{
				displayName: 'Operación',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['rut'] } },
				options: [
					{ name: 'Validar', value: 'validar', action: 'Validar RUT' },
					{ name: 'Formatear', value: 'formatear', action: 'Formatear RUT' },
					{ name: 'Limpiar', value: 'limpiar', action: 'Quitar formato' },
					{ name: 'Calcular DV', value: 'calcularDv', action: 'Calcular dígito verificador' },
				],
				default: 'validar',
			},
			{
				displayName: 'Operación',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['indicadores'] } },
				options: [
					{ name: 'Todos los Indicadores', value: 'todos', action: 'Obtener todos' },
					{ name: 'UF', value: 'uf', action: 'Valor UF' },
					{ name: 'UTM', value: 'utm', action: 'Valor UTM' },
					{ name: 'Dólar', value: 'dolar', action: 'Valor Dólar' },
					{ name: 'Euro', value: 'euro', action: 'Valor Euro' },
					{ name: 'Convertir UF a Pesos', value: 'convertirUfPesos', action: 'UF a Pesos' },
					{ name: 'Convertir Pesos a UF', value: 'convertirPesosUf', action: 'Pesos a UF' },
				],
				default: 'uf',
			},
			{
				displayName: 'RUT',
				name: 'rut',
				type: 'string',
				default: '',
				placeholder: '12345678-9',
				displayOptions: {
					show: { resource: ['rut'] },
					hide: { operation: ['calcularDv'] },
				},
			},
			{
				displayName: 'Número (sin DV)',
				name: 'numeroRut',
				type: 'number',
				default: 0,
				displayOptions: { show: { resource: ['rut'], operation: ['calcularDv'] } },
			},
			{
				displayName: 'Fecha',
				name: 'fecha',
				type: 'string',
				default: '',
				placeholder: 'DD-MM-YYYY (vacío = hoy)',
				displayOptions: {
					show: { resource: ['indicadores'] },
					hide: { operation: ['todos', 'convertirUfPesos', 'convertirPesosUf'] },
				},
			},
			{
				displayName: 'Monto en UF',
				name: 'montoUf',
				type: 'number',
				default: 0,
				displayOptions: { show: { resource: ['indicadores'], operation: ['convertirUfPesos'] } },
			},
			{
				displayName: 'Monto en Pesos',
				name: 'montoPesos',
				type: 'number',
				default: 0,
				displayOptions: { show: { resource: ['indicadores'], operation: ['convertirPesosUf'] } },
			},
			{
				displayName: 'Tipo Documento',
				name: 'tipoDte',
				type: 'options',
				options: [
					{ name: 'Boleta Electrónica (39)', value: 39 },
					{ name: 'Boleta Exenta (41)', value: 41 },
					{ name: 'Factura Electrónica (33)', value: 33 },
					{ name: 'Factura Exenta (34)', value: 34 },
				],
				default: 39,
				displayOptions: { show: { resource: ['emitir'] } },
			},
			{
				displayName: 'RUT Receptor',
				name: 'rutReceptor',
				type: 'string',
				default: '66666666-6',
				displayOptions: { show: { resource: ['emitir'] } },
			},
			{
				displayName: 'Razón Social',
				name: 'razonSocial',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['emitir'], tipoDte: [33, 34] } },
			},
			{
				displayName: 'Giro',
				name: 'giro',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['emitir'], tipoDte: [33, 34] } },
			},
			{
				displayName: 'Dirección',
				name: 'direccion',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['emitir'], tipoDte: [33, 34] } },
			},
			{
				displayName: 'Comuna',
				name: 'comuna',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['emitir'], tipoDte: [33, 34] } },
			},
			{
				displayName: 'Items',
				name: 'items',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				displayOptions: { show: { resource: ['emitir'] } },
				options: [
					{
						name: 'item',
						displayName: 'Item',
						values: [
							{ displayName: 'Nombre', name: 'nombre', type: 'string', default: '' },
							{ displayName: 'Cantidad', name: 'cantidad', type: 'number', default: 1 },
							{ displayName: 'Precio', name: 'precio', type: 'number', default: 0 },
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: { [key: string]: any } = {};

				if (resource === 'rut') {
					if (operation === 'validar') {
						const rut = this.getNodeParameter('rut', i) as string;
						result = validarRut(rut);
					} else if (operation === 'formatear') {
						const rut = this.getNodeParameter('rut', i) as string;
						result = formatearRut(rut);
					} else if (operation === 'limpiar') {
						const rut = this.getNodeParameter('rut', i) as string;
						result = limpiarRut(rut);
					} else if (operation === 'calcularDv') {
						const numero = this.getNodeParameter('numeroRut', i) as number;
						result = calcularDv(numero);
					}
				} else if (resource === 'indicadores') {
					if (operation === 'todos') {
						result = await obtenerTodosIndicadores(this);
					} else if (operation === 'convertirUfPesos') {
						const monto = this.getNodeParameter('montoUf', i) as number;
						result = await convertirUfPesos(this, monto);
					} else if (operation === 'convertirPesosUf') {
						const monto = this.getNodeParameter('montoPesos', i) as number;
						result = await convertirPesosUf(this, monto);
					} else {
						const fecha = this.getNodeParameter('fecha', i) as string;
						result = await obtenerIndicador(this, operation, fecha);
					}
				} else if (resource === 'emitir') {
					const credentials = await this.getCredentials('siiChileApi').catch(() => null);
					if (!credentials) {
						throw new NodeOperationError(this.getNode(), 'Configura credenciales de OpenFactura o SimpleAPI');
					}
					const tipoDte = this.getNodeParameter('tipoDte', i) as number;
					const rutReceptor = this.getNodeParameter('rutReceptor', i) as string;
					const itemsData = this.getNodeParameter('items', i) as { item: Array<{nombre: string, cantidad: number, precio: number}> };
					result = await emitirDte(this, credentials, tipoDte, rutReceptor, itemsData.item || []);
				}

				returnData.push({ json: result });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}

// ============ FUNCIONES RUT ============
function calcularDigitoVerificador(n: number): string {
	let suma = 0, m = 2;
	const s = n.toString();
	for (let i = s.length - 1; i >= 0; i--) {
		suma += parseInt(s[i]) * m;
		m = m === 7 ? 2 : m + 1;
	}
	const dv = 11 - (suma % 11);
	return dv === 11 ? '0' : dv === 10 ? 'K' : dv.toString();
}

function formatearRutInterno(rut: string): string {
	const c = rut.slice(0, -1), dv = rut.slice(-1);
	let f = '', cnt = 0;
	for (let i = c.length - 1; i >= 0; i--) {
		f = c[i] + f;
		cnt++;
		if (cnt === 3 && i !== 0) { f = '.' + f; cnt = 0; }
	}
	return `${f}-${dv}`;
}

function validarRut(rut: string): object {
	const r = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
	if (!/^[0-9]+[0-9K]$/.test(r)) return { valido: false, error: 'Formato inválido' };
	const cuerpo = r.slice(0, -1);
	const dvIngresado = r.slice(-1);
	const dvCalculado = calcularDigitoVerificador(parseInt(cuerpo));
	return {
		valido: dvIngresado === dvCalculado,
		rut: formatearRutInterno(r),
		dv: dvCalculado,
		mensaje: dvIngresado === dvCalculado ? 'RUT válido' : 'DV incorrecto',
	};
}

function formatearRut(rut: string): object {
	const r = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
	return { original: rut, formateado: formatearRutInterno(r), sinFormato: r };
}

function limpiarRut(rut: string): object {
	const r = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
	return { original: rut, limpio: r, cuerpo: r.slice(0, -1), dv: r.slice(-1) };
}

function calcularDv(numero: number): object {
	const dv = calcularDigitoVerificador(numero);
	return { numero, dv, rut: `${numero}-${dv}`, formateado: formatearRutInterno(`${numero}${dv}`) };
}

// ============ FUNCIONES INDICADORES ============
async function obtenerTodosIndicadores(ctx: IExecuteFunctions): Promise<object> {
	const r = await ctx.helpers.httpRequest({ method: 'GET' as IHttpRequestMethods, url: 'https://mindicador.cl/api', json: true });
	return {
		fecha: r.fecha,
		uf: { valor: r.uf?.valor, fecha: r.uf?.fecha },
		utm: { valor: r.utm?.valor, fecha: r.utm?.fecha },
		dolar: { valor: r.dolar?.valor, fecha: r.dolar?.fecha },
		euro: { valor: r.euro?.valor, fecha: r.euro?.fecha },
	};
}

async function obtenerIndicador(ctx: IExecuteFunctions, tipo: string, fecha: string): Promise<object> {
	const url = fecha ? `https://mindicador.cl/api/${tipo}/${fecha}` : `https://mindicador.cl/api/${tipo}`;
	const r = await ctx.helpers.httpRequest({ method: 'GET' as IHttpRequestMethods, url, json: true });
	if (r.serie?.length > 0) {
		return { indicador: tipo.toUpperCase(), valor: r.serie[0].valor, fecha: r.serie[0].fecha };
	}
	return { error: 'Sin datos' };
}

async function convertirUfPesos(ctx: IExecuteFunctions, montoUf: number): Promise<object> {
	const uf = await obtenerIndicador(ctx, 'uf', '') as { valor: number };
	const pesos = Math.round(montoUf * uf.valor);
	return { montoUf, valorUf: uf.valor, montoPesos: pesos };
}

async function convertirPesosUf(ctx: IExecuteFunctions, pesos: number): Promise<object> {
	const uf = await obtenerIndicador(ctx, 'uf', '') as { valor: number };
	return { montoPesos: pesos, valorUf: uf.valor, montoUf: Math.round((pesos / uf.valor) * 10000) / 10000 };
}

// ============ FUNCIONES EMITIR DTE ============
async function emitirDte(ctx: IExecuteFunctions, credentials: any, tipo: number, rutReceptor: string, items: Array<{nombre: string, cantidad: number, precio: number}>): Promise<object> {
	const baseUrl = credentials.openfacturaEnvironment === 'production'
		? 'https://api.openfactura.cl/v1'
		: 'https://dev-api.haulmer.com/v1';

	const detalle = items.map((item, idx) => ({
		NroLinDet: idx + 1,
		NmbItem: item.nombre,
		QtyItem: item.cantidad,
		PrcItem: item.precio,
		MontoItem: item.cantidad * item.precio,
	}));

	let total = 0;
	items.forEach(item => { total += item.cantidad * item.precio; });
	const neto = Math.round(total / 1.19);
	const iva = total - neto;

	const body = {
		response: ['PDF', 'FOLIO'],
		dte: {
			Encabezado: {
				IdDoc: { TipoDTE: tipo, FchEmis: new Date().toISOString().split('T')[0] },
				Emisor: { RUTEmisor: credentials.rutEmisor },
				Receptor: { RUTRecep: rutReceptor.replace(/\./g, '') },
				Totales: { MntNeto: neto, TasaIVA: 19, IVA: iva, MntTotal: total },
			},
			Detalle: detalle,
		},
	};

	const response = await ctx.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: `${baseUrl}/dte/document`,
		headers: { 'apikey': credentials.openfacturaApiKey, 'Content-Type': 'application/json' },
		body,
		json: true,
	});

	return { success: true, folio: response.FOLIO, tipo, total, pdf: response.PDF };
}
