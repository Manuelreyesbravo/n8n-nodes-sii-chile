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
			// ============ RECURSO ============
			{
				displayName: 'Recurso',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: '📄 Emitir DTE', value: 'emitir', description: 'Boletas y Facturas al SII' },
					{ name: '🔢 RUT', value: 'rut', description: 'Validar, formatear, calcular' },
					{ name: '💰 Indicadores', value: 'indicadores', description: 'UF, UTM, Dólar, Euro' },
					{ name: '📊 Consultar DTE', value: 'consultar', description: 'Estado de documentos' },
				],
				default: 'emitir',
			},

			// ============ OPERACIONES EMITIR ============
			{
				displayName: 'Operación',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['emitir'] } },
				options: [
					{ name: 'Emitir Boleta', value: 'emitirBoleta', action: 'Emitir boleta electrónica', description: 'Boleta afecta o exenta' },
					{ name: 'Emitir Factura', value: 'emitirFactura', action: 'Emitir factura electrónica', description: 'Factura a empresa' },
					{ name: 'Emitir Nota Crédito', value: 'emitirNotaCredito', action: 'Emitir nota de crédito' },
					{ name: 'Emitir Nota Débito', value: 'emitirNotaDebito', action: 'Emitir nota de débito' },
				],
				default: 'emitirBoleta',
			},

			// ============ OPERACIONES RUT ============
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
					{ name: 'Generar Aleatorio', value: 'generarAleatorio', action: 'RUT válido aleatorio' },
				],
				default: 'validar',
			},

			// ============ OPERACIONES INDICADORES ============
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
					{ name: 'IPC', value: 'ipc', action: 'Valor IPC' },
					{ name: 'Convertir UF ↔ Pesos', value: 'convertir', action: 'Conversión' },
				],
				default: 'uf',
			},

			// ============ OPERACIONES CONSULTAR ============
			{
				displayName: 'Operación',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['consultar'] } },
				options: [
					{ name: 'Estado DTE', value: 'estadoDte', action: 'Consultar estado' },
					{ name: 'Descargar PDF', value: 'descargarPdf', action: 'Obtener PDF' },
					{ name: 'Descargar XML', value: 'descargarXml', action: 'Obtener XML' },
				],
				default: 'estadoDte',
			},

			// ============ CAMPOS EMITIR DTE ============
			{
				displayName: 'Tipo Documento',
				name: 'tipoDte',
				type: 'options',
				options: [
					{ name: 'Boleta Electrónica (39)', value: 39 },
					{ name: 'Boleta Exenta (41)', value: 41 },
					{ name: 'Factura Electrónica (33)', value: 33 },
					{ name: 'Factura Exenta (34)', value: 34 },
					{ name: 'Nota Crédito (61)', value: 61 },
					{ name: 'Nota Débito (56)', value: 56 },
				],
				default: 39,
				displayOptions: { show: { resource: ['emitir'] } },
			},
			{
				displayName: 'RUT Receptor',
				name: 'rutReceptor',
				type: 'string',
				default: '66666666-6',
				placeholder: '12345678-9',
				description: 'RUT del cliente. Usar 66666666-6 para boleta sin RUT',
				displayOptions: { show: { resource: ['emitir'] } },
			},
			{
				displayName: 'Razón Social',
				name: 'razonSocial',
				type: 'string',
				default: '',
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						tipoDte: [33, 34, 61, 56],
					} 
				},
			},
			{
				displayName: 'Giro',
				name: 'giro',
				type: 'string',
				default: '',
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						tipoDte: [33, 34, 61, 56],
					} 
				},
			},
			{
				displayName: 'Dirección',
				name: 'direccion',
				type: 'string',
				default: '',
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						tipoDte: [33, 34, 61, 56],
					} 
				},
			},
			{
				displayName: 'Comuna',
				name: 'comuna',
				type: 'string',
				default: '',
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						tipoDte: [33, 34, 61, 56],
					} 
				},
			},
			{
				displayName: 'Ciudad',
				name: 'ciudad',
				type: 'string',
				default: '',
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						tipoDte: [33, 34, 61, 56],
					} 
				},
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
							{ displayName: 'Nombre/Descripción', name: 'nombre', type: 'string', default: '' },
							{ displayName: 'Cantidad', name: 'cantidad', type: 'number', default: 1 },
							{ displayName: 'Precio Unitario', name: 'precio', type: 'number', default: 0, description: 'Precio con IVA incluido para boletas' },
							{ displayName: 'Exento de IVA', name: 'exento', type: 'boolean', default: false },
							{ displayName: 'Descuento %', name: 'descuento', type: 'number', default: 0 },
						],
					},
				],
			},
			// Referencia para NC/ND
			{
				displayName: 'Documento Referencia (Tipo)',
				name: 'refTipo',
				type: 'options',
				options: [
					{ name: 'Factura (33)', value: 33 },
					{ name: 'Factura Exenta (34)', value: 34 },
					{ name: 'Boleta (39)', value: 39 },
				],
				default: 33,
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						operation: ['emitirNotaCredito', 'emitirNotaDebito'],
					} 
				},
			},
			{
				displayName: 'Documento Referencia (Folio)',
				name: 'refFolio',
				type: 'number',
				default: 0,
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						operation: ['emitirNotaCredito', 'emitirNotaDebito'],
					} 
				},
			},
			{
				displayName: 'Razón Referencia',
				name: 'refRazon',
				type: 'string',
				default: 'Anula documento',
				displayOptions: { 
					show: { 
						resource: ['emitir'],
						operation: ['emitirNotaCredito', 'emitirNotaDebito'],
					} 
				},
			},

			// ============ CAMPOS RUT ============
			{
				displayName: 'RUT',
				name: 'rut',
				type: 'string',
				default: '',
				placeholder: '12345678-9',
				displayOptions: {
					show: { resource: ['rut'] },
					hide: { operation: ['calcularDv', 'generarAleatorio'] },
				},
			},
			{
				displayName: 'Número (sin DV)',
				name: 'numeroRut',
				type: 'number',
				default: 0,
				displayOptions: { show: { resource: ['rut'], operation: ['calcularDv'] } },
			},

			// ============ CAMPOS INDICADORES ============
			{
				displayName: 'Fecha',
				name: 'fecha',
				type: 'string',
				default: '',
				placeholder: 'DD-MM-YYYY (vacío = hoy)',
				displayOptions: {
					show: { resource: ['indicadores'] },
					hide: { operation: ['todos', 'convertir'] },
				},
			},
			{
				displayName: 'Dirección Conversión',
				name: 'direccionConversion',
				type: 'options',
				options: [
					{ name: 'UF → Pesos', value: 'uf_to_clp' },
					{ name: 'Pesos → UF', value: 'clp_to_uf' },
				],
				default: 'uf_to_clp',
				displayOptions: { show: { resource: ['indicadores'], operation: ['convertir'] } },
			},
			{
				displayName: 'Monto',
				name: 'montoConversion',
				type: 'number',
				default: 0,
				typeOptions: { numberPrecision: 4 },
				displayOptions: { show: { resource: ['indicadores'], operation: ['convertir'] } },
			},

			// ============ CAMPOS CONSULTAR ============
			{
				displayName: 'Folio',
				name: 'folioConsulta',
				type: 'number',
				default: 0,
				displayOptions: { show: { resource: ['consultar'] } },
			},
			{
				displayName: 'Tipo DTE',
				name: 'tipoConsulta',
				type: 'options',
				options: [
					{ name: 'Boleta (39)', value: 39 },
					{ name: 'Boleta Exenta (41)', value: 41 },
					{ name: 'Factura (33)', value: 33 },
					{ name: 'Factura Exenta (34)', value: 34 },
				],
				default: 39,
				displayOptions: { show: { resource: ['consultar'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Obtener credenciales si existen
		let credentials: any = null;
		try {
			credentials = await this.getCredentials('siiChileApi');
		} catch (e) {
			// Sin credenciales, solo funciones locales
		}

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any = {};

				// ============ EMITIR DTE ============
				if (resource === 'emitir') {
					if (!credentials || credentials.provider === 'none') {
						throw new NodeOperationError(this.getNode(), 'Configura credenciales de OpenFactura o SimpleAPI para emitir DTEs');
					}

					const tipoDte = this.getNodeParameter('tipoDte', i) as number;
					const rutReceptor = this.getNodeParameter('rutReceptor', i) as string;
					const itemsData = this.getNodeParameter('items', i) as { item: any[] };

					// Datos receptor para facturas
					let receptor: any = { rut: rutReceptor };
					if ([33, 34, 61, 56].includes(tipoDte)) {
						receptor.razon_social = this.getNodeParameter('razonSocial', i) as string;
						receptor.giro = this.getNodeParameter('giro', i) as string;
						receptor.direccion = this.getNodeParameter('direccion', i) as string;
						receptor.comuna = this.getNodeParameter('comuna', i) as string;
						receptor.ciudad = this.getNodeParameter('ciudad', i) as string;
					}

					// Referencia para NC/ND
					let referencia = null;
					if (operation === 'emitirNotaCredito' || operation === 'emitirNotaDebito') {
						referencia = {
							tipo: this.getNodeParameter('refTipo', i) as number,
							folio: this.getNodeParameter('refFolio', i) as number,
							razon: this.getNodeParameter('refRazon', i) as string,
						};
					}

					if (credentials.provider === 'openfactura') {
						result = await this.emitirOpenFactura(credentials, tipoDte, receptor, itemsData.item || [], referencia);
					} else if (credentials.provider === 'simpleapi') {
						result = await this.emitirSimpleApi(credentials, tipoDte, receptor, itemsData.item || [], referencia);
					}
				}

				// ============ RUT ============
				else if (resource === 'rut') {
					if (operation === 'validar') {
						result = this.validarRut(this.getNodeParameter('rut', i) as string);
					} else if (operation === 'formatear') {
						result = this.formatearRut(this.getNodeParameter('rut', i) as string);
					} else if (operation === 'limpiar') {
						result = this.limpiarRut(this.getNodeParameter('rut', i) as string);
					} else if (operation === 'calcularDv') {
						result = this.calcularDv(this.getNodeParameter('numeroRut', i) as number);
					} else if (operation === 'generarAleatorio') {
						result = this.generarRutAleatorio();
					}
				}

				// ============ INDICADORES ============
				else if (resource === 'indicadores') {
					if (operation === 'todos') {
						result = await this.obtenerTodosIndicadores();
					} else if (operation === 'convertir') {
						const direccion = this.getNodeParameter('direccionConversion', i) as string;
						const monto = this.getNodeParameter('montoConversion', i) as number;
						result = await this.convertirMoneda(direccion, monto);
					} else {
						const fecha = this.getNodeParameter('fecha', i) as string;
						result = await this.obtenerIndicador(operation, fecha);
					}
				}

				// ============ CONSULTAR ============
				else if (resource === 'consultar') {
					if (!credentials || credentials.provider === 'none') {
						throw new NodeOperationError(this.getNode(), 'Configura credenciales para consultar DTEs');
					}

					const folio = this.getNodeParameter('folioConsulta', i) as number;
					const tipo = this.getNodeParameter('tipoConsulta', i) as number;

					if (credentials.provider === 'openfactura') {
						result = await this.consultarOpenFactura(credentials, tipo, folio, operation);
					}
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

	// ============ OPENFACTURA ============
	private async emitirOpenFactura(credentials: any, tipo: number, receptor: any, items: any[], referencia: any): Promise<object> {
		const baseUrl = credentials.openfacturaEnvironment === 'production'
			? 'https://api.openfactura.cl/v1'
			: 'https://dev-api.haulmer.com/v1';

		// Construir detalle
		const detalle = items.map((item, idx) => ({
			NroLinDet: idx + 1,
			NmbItem: item.nombre,
			QtyItem: item.cantidad,
			PrcItem: item.precio,
			MontoItem: item.cantidad * item.precio,
			IndExe: item.exento ? 1 : undefined,
			DescuentoPct: item.descuento || undefined,
		}));

		// Calcular totales
		let montoNeto = 0;
		let montoExento = 0;
		items.forEach(item => {
			const subtotal = item.cantidad * item.precio;
			if (item.exento) {
				montoExento += subtotal;
			} else {
				// Para boletas el precio ya incluye IVA
				if (tipo === 39 || tipo === 41) {
					montoNeto += Math.round(subtotal / 1.19);
				} else {
					montoNeto += subtotal;
				}
			}
		});

		const iva = Math.round(montoNeto * 0.19);
		const total = montoNeto + iva + montoExento;

		const body: any = {
			response: ['PDF', 'FOLIO', 'TIMBRE'],
			dte: {
				Encabezado: {
					IdDoc: {
						TipoDTE: tipo,
						FchEmis: new Date().toISOString().split('T')[0],
					},
					Emisor: {
						RUTEmisor: credentials.rutEmisor,
					},
					Receptor: {
						RUTRecep: receptor.rut?.replace(/\./g, '') || '66666666-6',
						RznSocRecep: receptor.razon_social || 'Sin Razón Social',
						GiroRecep: receptor.giro,
						DirRecep: receptor.direccion,
						CmnaRecep: receptor.comuna,
						CiudadRecep: receptor.ciudad,
					},
					Totales: {
						MntNeto: montoNeto,
						MntExe: montoExento || undefined,
						TasaIVA: 19,
						IVA: iva,
						MntTotal: total,
					},
				},
				Detalle: detalle,
			},
		};

		// Agregar referencia para NC/ND
		if (referencia) {
			body.dte.Referencia = [{
				NroLinRef: 1,
				TpoDocRef: referencia.tipo,
				FolioRef: referencia.folio,
				FchRef: new Date().toISOString().split('T')[0],
				RazonRef: referencia.razon,
				CodRef: 1,
			}];
		}

		const response = await this.helpers.httpRequest({
			method: 'POST' as IHttpRequestMethods,
			url: `${baseUrl}/dte/document`,
			headers: {
				'apikey': credentials.openfacturaApiKey,
				'Content-Type': 'application/json',
			},
			body: body,
			json: true,
		});

		return {
			success: true,
			provider: 'OpenFactura',
			folio: response.FOLIO,
			tipo: tipo,
			tipoNombre: this.getNombreTipo(tipo),
			total: total,
			pdf: response.PDF,
			timbre: response.TIMBRE,
			urlAutoservicio: response.SELF_SERVICE,
			response: response,
		};
	}

	private async consultarOpenFactura(credentials: any, tipo: number, folio: number, operation: string): Promise<object> {
		const baseUrl = credentials.openfacturaEnvironment === 'production'
			? 'https://api.openfactura.cl/v1'
			: 'https://dev-api.haulmer.com/v1';

		const response = await this.helpers.httpRequest({
			method: 'GET' as IHttpRequestMethods,
			url: `${baseUrl}/dte/document/${credentials.rutEmisor}/${tipo}/${folio}`,
			headers: {
				'apikey': credentials.openfacturaApiKey,
			},
			json: true,
		});

		return {
			folio: folio,
			tipo: tipo,
			estado: response,
		};
	}

	// ============ SIMPLEAPI ============
	private async emitirSimpleApi(credentials: any, tipo: number, receptor: any, items: any[], referencia: any): Promise<object> {
		const detalle = items.map(item => ({
			Nombre: item.nombre,
			Cantidad: item.cantidad,
			Precio: item.precio,
			Exento: item.exento || false,
		}));

		const body: any = {
			TipoDTE: tipo,
			Receptor: {
				Rut: receptor.rut?.replace(/\./g, '') || '66666666-6',
				RazonSocial: receptor.razon_social,
				Giro: receptor.giro,
				Direccion: receptor.direccion,
				Comuna: receptor.comuna,
			},
			Detalle: detalle,
		};

		if (referencia) {
			body.Referencia = {
				TipoDocumento: referencia.tipo,
				Folio: referencia.folio,
				Razon: referencia.razon,
			};
		}

		const response = await this.helpers.httpRequest({
			method: 'POST' as IHttpRequestMethods,
			url: 'https://api.simpleapi.cl/api/v1/dte/emitir',
			headers: {
				'Authorization': `Bearer ${credentials.simpleapiApiKey}`,
				'Content-Type': 'application/json',
			},
			body: body,
			json: true,
		});

		return {
			success: true,
			provider: 'SimpleAPI',
			folio: response.Folio,
			tipo: tipo,
			tipoNombre: this.getNombreTipo(tipo),
			trackId: response.TrackId,
			pdf: response.Pdf,
			xml: response.Xml,
			response: response,
		};
	}

	// ============ RUT ============
	private validarRut(rut: string): object {
		const r = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
		if (!/^[0-9]+[0-9K]$/.test(r)) return { valido: false, error: 'Formato inválido' };
		const cuerpo = r.slice(0, -1);
		const dvIngresado = r.slice(-1);
		const dvCalculado = this.calcularDigitoVerificador(parseInt(cuerpo));
		return {
			valido: dvIngresado === dvCalculado,
			rut: this.formatearRutInterno(r),
			dv: dvCalculado,
			mensaje: dvIngresado === dvCalculado ? '✅ RUT válido' : '❌ DV incorrecto',
		};
	}

	private formatearRut(rut: string): object {
		const r = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
		return { original: rut, formateado: this.formatearRutInterno(r), sinFormato: r };
	}

	private limpiarRut(rut: string): object {
		const r = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
		return { original: rut, limpio: r, cuerpo: r.slice(0, -1), dv: r.slice(-1) };
	}

	private calcularDv(numero: number): object {
		const dv = this.calcularDigitoVerificador(numero);
		return { numero, dv, rut: `${numero}-${dv}`, formateado: this.formatearRutInterno(`${numero}${dv}`) };
	}

	private generarRutAleatorio(): object {
		const numero = Math.floor(Math.random() * (25000000 - 5000000) + 5000000);
		const dv = this.calcularDigitoVerificador(numero);
		return { numero, dv, rut: `${numero}-${dv}`, formateado: this.formatearRutInterno(`${numero}${dv}`) };
	}

	private calcularDigitoVerificador(n: number): string {
		let suma = 0, m = 2;
		const s = n.toString();
		for (let i = s.length - 1; i >= 0; i--) {
			suma += parseInt(s[i]) * m;
			m = m === 7 ? 2 : m + 1;
		}
		const dv = 11 - (suma % 11);
		return dv === 11 ? '0' : dv === 10 ? 'K' : dv.toString();
	}

	private formatearRutInterno(rut: string): string {
		const c = rut.slice(0, -1), dv = rut.slice(-1);
		let f = '', cnt = 0;
		for (let i = c.length - 1; i >= 0; i--) {
			f = c[i] + f; cnt++;
			if (cnt === 3 && i !== 0) { f = '.' + f; cnt = 0; }
		}
		return `${f}-${dv}`;
	}

	// ============ INDICADORES ============
	private async obtenerTodosIndicadores(): Promise<object> {
		const r = await this.helpers.httpRequest({ method: 'GET' as IHttpRequestMethods, url: 'https://mindicador.cl/api', json: true });
		return {
			fecha: r.fecha,
			uf: { valor: r.uf?.valor, fecha: r.uf?.fecha },
			utm: { valor: r.utm?.valor, fecha: r.utm?.fecha },
			dolar: { valor: r.dolar?.valor, fecha: r.dolar?.fecha },
			euro: { valor: r.euro?.valor, fecha: r.euro?.fecha },
			ipc: { valor: r.ipc?.valor, fecha: r.ipc?.fecha },
			bitcoin: { valor: r.bitcoin?.valor, fecha: r.bitcoin?.fecha },
		};
	}

	private async obtenerIndicador(tipo: string, fecha: string): Promise<object> {
		const url = fecha ? `https://mindicador.cl/api/${tipo}/${fecha}` : `https://mindicador.cl/api/${tipo}`;
		const r = await this.helpers.httpRequest({ method: 'GET' as IHttpRequestMethods, url, json: true });
		if (r.serie?.length > 0) {
			return {
				indicador: tipo.toUpperCase(),
				valor: r.serie[0].valor,
				fecha: r.serie[0].fecha,
				unidad: r.unidad_medida,
			};
		}
		return { error: 'Sin datos' };
	}

	private async convertirMoneda(direccion: string, monto: number): Promise<object> {
		const uf = await this.obtenerIndicador('uf', '') as any;
		if (direccion === 'uf_to_clp') {
			const pesos = Math.round(monto * uf.valor);
			return { uf: monto, pesos, valorUf: uf.valor, formateado: `$${pesos.toLocaleString('es-CL')}` };
		} else {
			const ufResult = Math.round((monto / uf.valor) * 10000) / 10000;
			return { pesos: monto, uf: ufResult, valorUf: uf.valor };
		}
	}

	private getNombreTipo(tipo: number): string {
		const nombres: any = { 33: 'Factura', 34: 'Factura Exenta', 39: 'Boleta', 41: 'Boleta Exenta', 61: 'Nota Crédito', 56: 'Nota Débito' };
		return nombres[tipo] || `Tipo ${tipo}`;
	}
}
