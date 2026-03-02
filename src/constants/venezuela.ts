// Venezuela: 25 estados con sus municipios
// Fuente: División Político-Territorial de Venezuela (DIVA)

export interface VeState {
    id: number;
    name: string;
    municipalities: { id: number; name: string }[];
}

export const VENEZUELA_STATES: VeState[] = [
    {
        id: 1, name: 'Amazonas',
        municipalities: [
            { id: 101, name: 'Alto Orinoco' }, { id: 102, name: 'Atabapo' }, { id: 103, name: 'Atures' },
            { id: 104, name: 'Autana' }, { id: 105, name: 'Manapiare' }, { id: 106, name: 'Maroa' }, { id: 107, name: 'Río Negro' },
        ],
    },
    {
        id: 2, name: 'Anzoátegui',
        municipalities: [
            { id: 201, name: 'Anaco' }, { id: 202, name: 'Aragua' }, { id: 203, name: 'Bolívar' },
            { id: 204, name: 'Bruzual' }, { id: 205, name: 'Cajigal' }, { id: 206, name: 'Carvajal' },
            { id: 207, name: 'Diego Bautista Urbaneja' }, { id: 208, name: 'Freites' }, { id: 209, name: 'Guanipa' },
            { id: 210, name: 'Guanta' }, { id: 211, name: 'Independencia' }, { id: 212, name: 'Libertad' },
            { id: 213, name: 'McGregor' }, { id: 214, name: 'Miranda' }, { id: 215, name: 'Monagas' },
            { id: 216, name: 'Peñalver' }, { id: 217, name: 'Piritu' }, { id: 218, name: 'San Juan de Capistrano' },
            { id: 219, name: 'Santa Ana' }, { id: 220, name: 'Simón Bolívar' }, { id: 221, name: 'Sotillo' },
        ],
    },
    {
        id: 3, name: 'Apure',
        municipalities: [
            { id: 301, name: 'Achaguas' }, { id: 302, name: 'Biruaca' }, { id: 303, name: 'Muñoz' },
            { id: 304, name: 'Páez' }, { id: 305, name: 'Pedro Camejo' }, { id: 306, name: 'Rómulo Gallegos' },
            { id: 307, name: 'San Fernando' },
        ],
    },
    {
        id: 4, name: 'Aragua',
        municipalities: [
            { id: 401, name: 'Bolívar' }, { id: 402, name: 'Camatagua' }, { id: 403, name: 'Francisco Linares Alcántara' },
            { id: 404, name: 'Girardot' }, { id: 405, name: 'José Ángel Lamas' }, { id: 406, name: 'José Félix Ribas' },
            { id: 407, name: 'José Rafael Revenga' }, { id: 408, name: 'Libertador' }, { id: 409, name: 'Mario Briceño Iragorry' },
            { id: 410, name: 'Ocumare de la Costa de Oro' }, { id: 411, name: 'San Casimiro' }, { id: 412, name: 'San Sebastián' },
            { id: 413, name: 'Santiago Mariño' }, { id: 414, name: 'Santos Michelena' }, { id: 415, name: 'Sucre' },
            { id: 416, name: 'Tovar' }, { id: 417, name: 'Urdaneta' }, { id: 418, name: 'Zamora' },
        ],
    },
    {
        id: 5, name: 'Barinas',
        municipalities: [
            { id: 501, name: 'Alberto Arvelo Torrealba' }, { id: 502, name: 'Antonio José de Sucre' }, { id: 503, name: 'Arismendi' },
            { id: 504, name: 'Barinas' }, { id: 505, name: 'Bolívar' }, { id: 506, name: 'Cruz Paredes' },
            { id: 507, name: 'Ezequiel Zamora' }, { id: 508, name: 'Obispos' }, { id: 509, name: 'Pedraza' },
            { id: 510, name: 'Rojas' }, { id: 511, name: 'Rubén Gallegos' }, { id: 512, name: 'Sosa' },
        ],
    },
    {
        id: 6, name: 'Bolívar',
        municipalities: [
            { id: 601, name: 'Angostura del Orinoco' }, { id: 602, name: 'Caroní' }, { id: 603, name: 'Cedeño' },
            { id: 604, name: 'El Callao' }, { id: 605, name: 'Gran Sabana' }, { id: 606, name: 'Heres' },
            { id: 607, name: 'Piar' }, { id: 608, name: 'Raúl Leoni' }, { id: 609, name: 'Roscio' },
            { id: 610, name: 'Sifontes' }, { id: 611, name: 'Sucre' },
        ],
    },
    {
        id: 7, name: 'Carabobo',
        municipalities: [
            { id: 701, name: 'Bejuma' }, { id: 702, name: 'Carlos Arvelo' }, { id: 703, name: 'Diego Ibarra' },
            { id: 704, name: 'Guacara' }, { id: 705, name: 'Juan José Mora' }, { id: 706, name: 'Libertador' },
            { id: 707, name: 'Los Guayos' }, { id: 708, name: 'Miranda' }, { id: 709, name: 'Montalbán' },
            { id: 710, name: 'Naguanagua' }, { id: 711, name: 'Puerto Cabello' }, { id: 712, name: 'San Diego' },
            { id: 713, name: 'San Joaquín' }, { id: 714, name: 'Valencia' },
        ],
    },
    {
        id: 8, name: 'Cojedes',
        municipalities: [
            { id: 801, name: 'Anzoátegui' }, { id: 802, name: 'Girardot' }, { id: 803, name: 'Lima Blanco' },
            { id: 804, name: 'Pao de San Juan Bautista' }, { id: 805, name: 'Ricaurte' }, { id: 806, name: 'Rómulo Gallegos' },
            { id: 807, name: 'San Carlos' }, { id: 808, name: 'Tinaco' }, { id: 809, name: 'Tinaquillo' },
        ],
    },
    {
        id: 9, name: 'Delta Amacuro',
        municipalities: [
            { id: 901, name: 'Antonio Díaz' }, { id: 902, name: 'Casacoima' }, { id: 903, name: 'Pedernales' }, { id: 904, name: 'Tucupita' },
        ],
    },
    {
        id: 10, name: 'Distrito Capital',
        municipalities: [
            { id: 1001, name: 'Libertador' },
        ],
    },
    {
        id: 11, name: 'Falcón',
        municipalities: [
            { id: 1101, name: 'Acosta' }, { id: 1102, name: 'Bolívar' }, { id: 1103, name: 'Buchivacoa' },
            { id: 1104, name: 'Carirubana' }, { id: 1105, name: 'Colina' }, { id: 1106, name: 'Dabajuro' },
            { id: 1107, name: 'Democracia' }, { id: 1108, name: 'Federación' }, { id: 1109, name: 'Jacura' },
            { id: 1110, name: 'Los Taques' }, { id: 1111, name: 'Mauroa' }, { id: 1112, name: 'Miranda' },
            { id: 1113, name: 'Monseñor Iturriza' }, { id: 1114, name: 'Páez' }, { id: 1115, name: 'Palmasola' },
            { id: 1116, name: 'Petit' }, { id: 1117, name: 'Piritu' }, { id: 1118, name: 'San Francisco' },
            { id: 1119, name: 'Silva' }, { id: 1120, name: 'Sucre' }, { id: 1121, name: 'Tocópero' },
            { id: 1122, name: 'Unión' }, { id: 1123, name: 'Urumaco' }, { id: 1124, name: 'Zamora' },
        ],
    },
    {
        id: 12, name: 'Guárico',
        municipalities: [
            { id: 1201, name: 'Camaguán' }, { id: 1202, name: 'Chaguaramas' }, { id: 1203, name: 'El Socorro' },
            { id: 1204, name: 'Francisco de Miranda' }, { id: 1205, name: 'José Félix Ribas' }, { id: 1206, name: 'José Tadeo Monagas' },
            { id: 1207, name: 'Juan Germán Roscio' }, { id: 1208, name: 'Juan José Rondón' }, { id: 1209, name: 'Las Mercedes' },
            { id: 1210, name: 'Leonardo Infante' }, { id: 1211, name: 'Mellado' }, { id: 1212, name: 'Ortiz' },
            { id: 1213, name: 'San Gerónimo de Guayabal' }, { id: 1214, name: 'San Juan de los Morros' },
            { id: 1215, name: 'Santa María de Ipire' }, { id: 1216, name: 'Zaraza' },
        ],
    },
    {
        id: 13, name: 'La Guaira',
        municipalities: [
            { id: 1301, name: 'Vargas' },
        ],
    },
    {
        id: 14, name: 'Lara',
        municipalities: [
            { id: 1401, name: 'Andrés Eloy Blanco' }, { id: 1402, name: 'Crespo' }, { id: 1403, name: 'Iribarren' },
            { id: 1404, name: 'Jiménez' }, { id: 1405, name: 'Morán' }, { id: 1406, name: 'Palavecino' },
            { id: 1407, name: 'Simón Planas' }, { id: 1408, name: 'Torres' }, { id: 1409, name: 'Urdaneta' },
        ],
    },
    {
        id: 15, name: 'Mérida',
        municipalities: [
            { id: 1501, name: 'Alberto Adriani' }, { id: 1502, name: 'Andrés Bello' }, { id: 1503, name: 'Antonio Pinto Salinas' },
            { id: 1504, name: 'Aricagua' }, { id: 1505, name: 'Arzobispo Chacón' }, { id: 1506, name: 'Campo Elías' },
            { id: 1507, name: 'Caracciolo Parra Olmedo' }, { id: 1508, name: 'Cardenal Quintero' }, { id: 1509, name: 'Guaraque' },
            { id: 1510, name: 'Julio César Salas' }, { id: 1511, name: 'Justo Briceño' }, { id: 1512, name: 'Libertador' },
            { id: 1513, name: 'Miranda' }, { id: 1514, name: 'Obispo Ramos de Lora' }, { id: 1515, name: 'Padre Noguera' },
            { id: 1516, name: 'Pueblo Llano' }, { id: 1517, name: 'Rangel' }, { id: 1518, name: 'Rivas Dávila' },
            { id: 1519, name: 'Santos Marquina' }, { id: 1520, name: 'Sucre' }, { id: 1521, name: 'Tovar' },
            { id: 1522, name: 'Tulio Febres Cordero' }, { id: 1523, name: 'Zea' },
        ],
    },
    {
        id: 16, name: 'Miranda',
        municipalities: [
            { id: 1601, name: 'Acevedo' }, { id: 1602, name: 'Andrés Bello' }, { id: 1603, name: 'Baruta' },
            { id: 1604, name: 'Brión' }, { id: 1605, name: 'Buroz' }, { id: 1606, name: 'Carrizal' },
            { id: 1607, name: 'Chacao' }, { id: 1608, name: 'Cristóbal Rojas' }, { id: 1609, name: 'El Hatillo' },
            { id: 1610, name: 'Guaicaipuro' }, { id: 1611, name: 'Independencia' }, { id: 1612, name: 'Lander' },
            { id: 1613, name: 'Libertador' }, { id: 1614, name: 'Los Salias' }, { id: 1615, name: 'Páez' },
            { id: 1616, name: 'Paz Castillo' }, { id: 1617, name: 'Pedro Gual' }, { id: 1618, name: 'Plaza' },
            { id: 1619, name: 'Simón Bolívar' }, { id: 1620, name: 'Sucre' }, { id: 1621, name: 'Urdaneta' },
            { id: 1622, name: 'Zamora' },
        ],
    },
    {
        id: 17, name: 'Monagas',
        municipalities: [
            { id: 1701, name: 'Acosta' }, { id: 1702, name: 'Aguasay' }, { id: 1703, name: 'Bolívar' },
            { id: 1704, name: 'Caripe' }, { id: 1705, name: 'Cedeño' }, { id: 1706, name: 'Ezequiel Zamora' },
            { id: 1707, name: 'Libertador' }, { id: 1708, name: 'Maturín' }, { id: 1709, name: 'Piar' },
            { id: 1710, name: 'Punceres' }, { id: 1711, name: 'Santa Bárbara' }, { id: 1712, name: 'Sotillo' },
            { id: 1713, name: 'Uracoa' },
        ],
    },
    {
        id: 18, name: 'Nueva Esparta',
        municipalities: [
            { id: 1801, name: 'Arismendi' }, { id: 1802, name: 'Antolín del Campo' }, { id: 1803, name: 'Díaz' },
            { id: 1804, name: 'García' }, { id: 1805, name: 'Gómez' }, { id: 1806, name: 'Guaribe' },
            { id: 1807, name: 'Macanao' }, { id: 1808, name: 'Maneiro' }, { id: 1809, name: 'Mariño' },
            { id: 1810, name: 'Península de Macanao' }, { id: 1811, name: 'Tubores' }, { id: 1812, name: 'Villalba' },
        ],
    },
    {
        id: 19, name: 'Portuguesa',
        municipalities: [
            { id: 1901, name: 'Aguán' }, { id: 1902, name: 'Araure' }, { id: 1903, name: 'Esteller' },
            { id: 1904, name: 'Guanare' }, { id: 1905, name: 'Guanarito' }, { id: 1906, name: 'José Vicente de Unda' },
            { id: 1907, name: 'Monseñor José Cocho' }, { id: 1908, name: 'Ospino' }, { id: 1909, name: 'Páez' },
            { id: 1910, name: 'Papelón' }, { id: 1911, name: 'San Genaro de Boconoito' }, { id: 1912, name: 'San Rafael de Onoto' },
            { id: 1913, name: 'Santa Rosalía' }, { id: 1914, name: 'Sucre' }, { id: 1915, name: 'Turen' },
        ],
    },
    {
        id: 20, name: 'Sucre',
        municipalities: [
            { id: 2001, name: 'Andrés Bello' }, { id: 2002, name: 'Arismendi' }, { id: 2003, name: 'Benitez' },
            { id: 2004, name: 'Bermúdez' }, { id: 2005, name: 'Cajigal' }, { id: 2006, name: 'Cruz Salmerón Acosta' },
            { id: 2007, name: 'Libertador' }, { id: 2008, name: 'Mariño' }, { id: 2009, name: 'Mejías' },
            { id: 2010, name: 'Montes' }, { id: 2011, name: 'Ribero' }, { id: 2012, name: 'Sucre' },
            { id: 2013, name: 'Valdez' },
        ],
    },
    {
        id: 21, name: 'Táchira',
        municipalities: [
            { id: 2101, name: 'Andrés Bello' }, { id: 2102, name: 'Antonio Rómulo Costa' }, { id: 2103, name: 'Ayacucho' },
            { id: 2104, name: 'Bolívar' }, { id: 2105, name: 'Cárdenas' }, { id: 2106, name: 'Córdoba' },
            { id: 2107, name: 'Fernández Feo' }, { id: 2108, name: 'Francisco de Miranda' }, { id: 2109, name: 'García de Hevia' },
            { id: 2110, name: 'Guásimos' }, { id: 2111, name: 'Independencia' }, { id: 2112, name: 'Jáuregui' },
            { id: 2113, name: 'José María Vargas' }, { id: 2114, name: 'Junín' }, { id: 2115, name: 'Libertad' },
            { id: 2116, name: 'Lobatera' }, { id: 2117, name: 'Michelena' }, { id: 2118, name: 'Montilla' },
            { id: 2119, name: 'Panamericano' }, { id: 2120, name: 'Pedro María Ureña' }, { id: 2121, name: 'Rafael Urdaneta' },
            { id: 2122, name: 'Samuel Darío Maldonado' }, { id: 2123, name: 'San Cristóbal' }, { id: 2124, name: 'San Judas Tadeo' },
            { id: 2125, name: 'Seboruco' }, { id: 2126, name: 'Simón Rodríguez' }, { id: 2127, name: 'Sucre' },
            { id: 2128, name: 'Torbes' }, { id: 2129, name: 'Uribante' },
        ],
    },
    {
        id: 22, name: 'Trujillo',
        municipalities: [
            { id: 2201, name: 'Andrés Bello' }, { id: 2202, name: 'Betijoque' }, { id: 2203, name: 'Boconó' },
            { id: 2204, name: 'Candelaria' }, { id: 2205, name: 'Carache' }, { id: 2206, name: 'Escuque' },
            { id: 2207, name: 'José Felipe Márquez Cañizales' }, { id: 2208, name: 'La Ceiba' }, { id: 2209, name: 'Miranda' },
            { id: 2210, name: 'Monte Carmelo' }, { id: 2211, name: 'Motatán' }, { id: 2212, name: 'Pampán' },
            { id: 2213, name: 'Pampanito' }, { id: 2214, name: 'Rafael Rangel' }, { id: 2215, name: 'San Rafael de Carvajal' },
            { id: 2216, name: 'Sucre' }, { id: 2217, name: 'Trujillo' }, { id: 2218, name: 'Urdaneta' }, { id: 2219, name: 'Valera' },
        ],
    },
    {
        id: 23, name: 'Yaracuy',
        municipalities: [
            { id: 2301, name: 'Arístides Bastidas' }, { id: 2302, name: 'Bruzual' }, { id: 2303, name: 'Cocorote' },
            { id: 2304, name: 'Independencia' }, { id: 2305, name: 'José Joaquín Veroes' }, { id: 2306, name: 'La Trinidad' },
            { id: 2307, name: 'Manuel Monge' }, { id: 2308, name: 'Nirgua' }, { id: 2309, name: 'Páez' },
            { id: 2310, name: 'Peña' }, { id: 2311, name: 'San Felipe' }, { id: 2312, name: 'Sucre' },
            { id: 2313, name: 'Urachiche' },
        ],
    },
    {
        id: 24, name: 'Zulia',
        municipalities: [
            { id: 2401, name: 'Almirante Padilla' }, { id: 2402, name: 'Baralt' }, { id: 2403, name: 'Cabimas' },
            { id: 2404, name: 'Catatumbo' }, { id: 2405, name: 'Colón' }, { id: 2406, name: 'Francisco Javier Pulgar' },
            { id: 2407, name: 'Jesús Enrique Lossada' }, { id: 2408, name: 'Jesús María Semprún' }, { id: 2409, name: 'La Cañada de Urdaneta' },
            { id: 2410, name: 'Lagunillas' }, { id: 2411, name: 'Machiques de Perijá' }, { id: 2412, name: 'Mara' },
            { id: 2413, name: 'Maracaibo' }, { id: 2414, name: 'Miranda' }, { id: 2415, name: 'Páez' },
            { id: 2416, name: 'Rosario de Perijá' }, { id: 2417, name: 'San Francisco' }, { id: 2418, name: 'Santa Rita' },
            { id: 2419, name: 'Simón Bolívar' }, { id: 2420, name: 'Sucre' }, { id: 2421, name: 'Valmore Rodríguez' },
        ],
    },
    {
        id: 25, name: 'Dependencias Federales',
        municipalities: [
            { id: 2501, name: 'N/A - Sin Municipio' },
        ],
    },
];
