import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class SiiChileApi implements ICredentialType {
	name = 'siiChileApi';
	displayName = 'SII Chile / Facturación Electrónica';
	documentationUrl = 'https://www.openfactura.cl/factura-electronica/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Proveedor de Facturación',
			name: 'provider',
			type: 'options',
			options: [
				{
					name: 'OpenFactura (Haulmer)',
					value: 'openfactura',
				},
				{
					name: 'SimpleAPI',
					value: 'simpleapi',
				},
				{
					name: 'Solo Funciones Locales (sin emisión)',
					value: 'none',
				},
			],
			default: 'none',
			description: 'Servicio para emitir DTEs al SII',
		},
		{
			displayName: 'API Key OpenFactura',
			name: 'openfacturaApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					provider: ['openfactura'],
				},
			},
			description: 'Obtener en panel.openfactura.cl',
		},
		{
			displayName: 'Ambiente OpenFactura',
			name: 'openfacturaEnvironment',
			type: 'options',
			options: [
				{
					name: 'Producción',
					value: 'production',
				},
				{
					name: 'Certificación (Pruebas)',
					value: 'certification',
				},
			],
			default: 'certification',
			displayOptions: {
				show: {
					provider: ['openfactura'],
				},
			},
		},
		{
			displayName: 'API Key SimpleAPI',
			name: 'simpleapiApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					provider: ['simpleapi'],
				},
			},
			description: 'Obtener en simpleapi.cl (tiene plan gratuito)',
		},
		{
			displayName: 'RUT Emisor',
			name: 'rutEmisor',
			type: 'string',
			default: '',
			placeholder: '76123456-7',
			description: 'RUT de tu empresa emisora',
			displayOptions: {
				hide: {
					provider: ['none'],
				},
			},
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://mindicador.cl',
			url: '/api',
			method: 'GET',
		},
	};
}