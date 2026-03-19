import React, { useState, useEffect, useCallback } from 'react';
import {
    Form, Input, Button, Select, DatePicker, AutoComplete, Upload,
    Radio, Typography, Row, Col, Divider, message, Progress
} from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined,
    UploadOutlined, CarOutlined, RocketOutlined, CheckCircleOutlined,
    BulbOutlined, FileTextOutlined, ArrowRightOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { api } from '../../../services/api';
import { PROFESSIONS_ES } from '../../../constants/professions';
import { VENEZUELA_STATES } from '../../../constants/venezuela';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;


// Removed hardcoded JOB_REQUISITION_ID as registration is now talent-pool based (free registration)
// const JOB_REQUISITION_ID = 1;

// ─── DESKTOP: 4 sections ───────────────────────────────────────────────────
const DESKTOP_STEPS = [
    {
        title: 'Datos Personales',
        icon: <UserOutlined />,
        fields: ['firstName', 'lastName', 'nationalId', 'birthDate', 'maritalStatus', 'gender', 'hasChildren', 'childrenCount'],
    },
    {
        title: 'Contacto',
        icon: <MailOutlined />,
        fields: ['email', 'phone', 'altPhone', 'stateId', 'municipalityId'],
    },
    {
        title: 'Requisitos',
        icon: <CarOutlined />,
        fields: ['hasVehicle', 'vehicleDetail', 'profession', 'salesExperience'],
    },
    {
        title: 'Tu CV',
        icon: <FileTextOutlined />,
        fields: [],
    },
];

// ─── MOBILE: fine-grained steps ─────────────────────────────────────────────
const MOBILE_STEPS = [
    { label: 'Nombres', fields: ['firstName', 'lastName'] },
    { label: 'Identidad', fields: ['nationalId', 'birthDate'] },
    { label: 'Personal', fields: ['maritalStatus', 'gender'] },
    { label: 'Familia', fields: ['hasChildren', 'childrenCount'] },
    { label: 'Email', fields: ['email', 'phone'] },
    { label: 'Teléfono alt', fields: ['altPhone'] },
    { label: 'Ubicación', fields: ['stateId', 'municipalityId'] },
    { label: 'Vehículo', fields: ['hasVehicle', 'vehicleDetail'] },
    { label: 'Perfil', fields: ['profession', 'salesExperience'] },
    { label: 'CV', fields: [] },
];

const RegistrationPage: React.FC = () => {
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentStep, setCurrentStep] = useState(0);

    // Data — loaded statically from venezuela.ts (no API call needed)
    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);

    // Watched values
    const [hasChildren, setHasChildren] = useState<boolean | null>(null);
    const [hasVehicle, setHasVehicle] = useState<string | null>(null);
    const [vehicleIsOwn, setVehicleIsOwn] = useState<string | null>(null);
    const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [professionOptions, setProfessionOptions] = useState(PROFESSIONS_ES.map(p => ({ value: p })));

    // Result pages
    const [result, setResult] = useState<'success' | null>(null);
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleStateChange = (stateId: number) => {
        setSelectedStateId(stateId);
        form.setFieldValue('municipalityId', undefined);
        const found = VENEZUELA_STATES.find(s => s.id === stateId);
        setMunicipalities(found ? found.municipalities : []);
    };


    const handleProfessionSearch = (value: string) => {
        const f = PROFESSIONS_ES.filter(p => p.toLowerCase().includes(value.toLowerCase())).map(p => ({ value: p }));
        setProfessionOptions(f.length ? f : [{ value }]);
    };

    // ── Get current step required fields ──────────────────────────────────
    const getCurrentRequiredFields = useCallback(() => {
        const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
        const step = steps[currentStep];
        if (!step) return [];

        let fields = [...step.fields];
        // Remove childrenCount if hasChildren is false
        if (!hasChildren) fields = fields.filter(f => f !== 'childrenCount');
        if (hasVehicle !== 'si') fields = fields.filter(f => f !== 'vehicleDetail');
        return fields;
    }, [isMobile, currentStep, hasChildren, hasVehicle]);

    // ── Next step ─────────────────────────────────────────────────────────
    const handleNext = async () => {
        const fieldsToValidate = getCurrentRequiredFields();
        try {
            if (fieldsToValidate.length > 0) {
                await form.validateFields(fieldsToValidate);
            }
            setCurrentStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            message.error('Por favor completa los campos requeridos antes de continuar.');
        }
    };

    const handleBack = () => {
        setCurrentStep(s => Math.max(0, s - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!cvFile) { message.error('Debes subir tu CV en formato PDF.'); return; }

        const values = form.getFieldsValue(true);
        setLoading(true);
        try {
            const fd = new FormData();
            if (cvFile) fd.append('cv', cvFile);
            // fd.append('jobRequisitionId', String(JOB_REQUISITION_ID)); // No longer needed for free registration
            fd.append('nationalId', values.nationalId);
            fd.append('firstName', values.firstName);
            fd.append('lastName', values.lastName);
            fd.append('email', values.email);
            fd.append('phone', values.phone);
            if (values.altPhone) fd.append('altPhone', values.altPhone);
            if (values.birthDate) fd.append('birthDate', dayjs(values.birthDate).toISOString());

            // Send names to allow backend to synchronize dynamically (robustness)
            const selectedMuni = municipalities.find(m => m.id === values.municipalityId);
            if (selectedMuni) fd.append('municipalityName', selectedMuni.name);
            fd.append('municipalityId', String(values.municipalityId));

            const selectedState = VENEZUELA_STATES.find(s => s.id === values.stateId);
            if (selectedState) fd.append('stateName', selectedState.name);
            if (values.stateId) fd.append('stateId', String(values.stateId));
            // hasVehicle = true only if they have a vehicle AND it's their own property
            const actuallyOwnsVehicle = values.hasVehicle === 'si' && values.vehicleIsOwn === 'si';
            fd.append('hasVehicle', String(actuallyOwnsVehicle));
            if (values.vehicleDetail) fd.append('vehicleDetail', values.vehicleDetail);
            if (values.profession) fd.append('profession', values.profession);
            if (values.gender) fd.append('gender', values.gender);
            if (values.maritalStatus) fd.append('maritalStatus', values.maritalStatus);
            fd.append('hasChildren', String(values.hasChildren === 'si'));
            if (values.childrenCount) fd.append('childrenCount', String(values.childrenCount));
            if (values.salesExperience !== undefined) fd.append('salesExperience', String(values.salesExperience === 'si'));

            const res = await api.post('/candidates/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccessData(res.data);
            setResult('success');
        } catch (err: any) {
            if (err.response?.data?.message) {
                // Display the exact message returned from the backend (e.g., "Ya te encuentras en un proceso activo...")
                const backendMsg = Array.isArray(err.response.data.message) 
                    ? err.response.data.message[0] 
                    : err.response.data.message;
                message.error(backendMsg);
            } else if (err.response?.status === 409) {
                message.warning('Ya existe una postulación con ese correo o cédula.');
            } else {
                message.error('Error al enviar. Por favor intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ══════════════════════════════════════════════════════════════════════
    // RESULT SCREENS
    // ══════════════════════════════════════════════════════════════════════
    if (result === 'success' && successData) {
        return (
            <div style={css.fullPage}>
                <div style={css.resultCard}>
                    <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>¡Postulación enviada!</Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, maxWidth: 450, textAlign: 'center', marginTop: 16 }}>
                        Gracias por postularte. Por favor, <strong>mantente atento a tus correos electrónicos</strong>, ya que te estaremos contactando por esa vía para los siguientes pasos.
                    </Paragraph>
                    <Button type="primary" size="large" style={{ marginTop: 32, height: 50, padding: '0 40px' }} onClick={() => window.location.href = 'https://tuproximoempleo.com'}>
                        Volver al inicio
                    </Button>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════
    // SHARED FORM SECTIONS (content rendered per step)
    // ══════════════════════════════════════════════════════════════════════
    const totalSteps = isMobile ? MOBILE_STEPS.length : DESKTOP_STEPS.length;
    const progressPercent = Math.round(((currentStep) / totalSteps) * 100);

    // ─── Section renderers ────────────────────────────────────────────────
    const renderPersonalData = () => (
        <>
            <StepHeading title="Datos Personales" subtitle="Cuéntanos quién eres" />
            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item name="firstName" label="Nombre(s)" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Ej: Juan Carlos" size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="lastName" label="Apellido(s)" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Ej: González Pérez" size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="nationalId" label="Cédula de Identidad"
                        rules={[{ required: true, message: 'Requerido' }, { pattern: /^V\d{6,8}$/, message: 'Formato: V12345678' }]}>
                        <Input prefix={<IdcardOutlined />} placeholder="V12345678" maxLength={10} size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="birthDate" label="Fecha de Nacimiento" rules={[{ required: true, message: 'Requerido' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" size="large"
                            disabledDate={d => d && d.isAfter(dayjs().subtract(18, 'year'))} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="maritalStatus" label="Estado Civil" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select placeholder="Selecciona..." size="large">
                            {['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión estable'].map(s => (
                                <Option key={s} value={s}>{s}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="gender" label="Género" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Radio.Button value="Masculino" style={css.radioBtn}>Masculino</Radio.Button>
                            <Radio.Button value="Femenino" style={css.radioBtn}>Femenino</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="hasChildren" label="¿Tiene hijos?" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Radio.Button value="si" style={css.radioBtn}>Sí</Radio.Button>
                            <Radio.Button value="no" style={css.radioBtn}>No</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                {hasChildren && (
                    <Col xs={24} sm={12}>
                        <Form.Item name="childrenCount" label="¿Cuántos hijos?" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Selecciona..." size="large">
                                {[1, 2, 3, 4, 5, 6, '7 o más'].map(n => (
                                    <Option key={String(n)} value={n}>{n}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                )}
            </Row>
        </>
    );

    const renderContact = () => (
        <>
            <StepHeading title="Contacto y Ubicación" subtitle="¿Dónde encontrarte?" />
            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Correo Electrónico"
                        rules={[{ required: true, type: 'email', message: 'Email válido requerido' }]}>
                        <Input prefix={<MailOutlined />} placeholder="tu@correo.com" size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="phone" label="Teléfono Principal"
                        rules={[{ required: true, message: 'Requerido' }, { pattern: /^(04\d{2}|02\d{2})\d{7}$/, message: 'Ej: 04141234567' }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="04141234567" maxLength={11} size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="altPhone" label="Teléfono Alternativo (opcional)">
                        <Input prefix={<PhoneOutlined />} placeholder="04241234567" maxLength={11} size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="stateId" label="Estado" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select showSearch placeholder="Selecciona tu estado..." optionFilterProp="children"
                            onChange={handleStateChange} size="large"
                            filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                            {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="municipalityId" label="Municipio" rules={[{ required: true, message: 'Selecciona primero el Estado' }]}>
                        <Select showSearch placeholder={selectedStateId ? 'Selecciona tu municipio...' : 'Primero elige el Estado'}
                            optionFilterProp="children" disabled={!selectedStateId} size="large"
                            filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                            {municipalities.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );

    const renderRequirements = () => {
        // hasVehicle true only when: has vehicle AND it's their own property
        const showOwnership = hasVehicle === 'si';
        const showVehicleType = hasVehicle === 'si' && vehicleIsOwn === 'si';

        return (
            <>
                <StepHeading title="Requisitos del Cargo" subtitle="Información clave para el puesto" />

                <Form.Item name="hasVehicle" label="¿Tienes vehículo disponible para el trabajo?" rules={[{ required: true, message: 'Requerido' }]}>
                    <Radio.Group style={{ width: '100%' }}>
                        <Row gutter={12}>
                            <Col xs={24} sm={12}>
                                <Radio.Button value="si" style={css.vehicleBtn}>🚗&nbsp;&nbsp;Sí, tengo vehículo</Radio.Button>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Radio.Button value="no" style={css.vehicleBtn}>🚶&nbsp;&nbsp;No tengo vehículo</Radio.Button>
                            </Col>
                        </Row>
                    </Radio.Group>
                </Form.Item>

                {showOwnership && (
                    <Form.Item name="vehicleIsOwn" label="¿Ese vehículo es de tu propiedad?" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Row gutter={12}>
                                <Col xs={24} sm={12}>
                                    <Radio.Button value="si" style={css.vehicleBtn}>✅&nbsp;&nbsp;Sí, es mío</Radio.Button>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Radio.Button value="no" style={css.vehicleBtn}>👥&nbsp;&nbsp;No, es de un familiar / préstamo</Radio.Button>
                                </Col>
                            </Row>
                        </Radio.Group>
                    </Form.Item>
                )}

                {showVehicleType && (
                    <Form.Item name="vehicleDetail" label="Tipo de vehículo" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select placeholder="Selecciona..." size="large">
                            {['Moto', 'Carro', 'Camioneta', 'Buseta', 'Otro'].map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </Form.Item>
                )}

                {/* Profesión y experiencia: siempre visible, independiente del vehículo */}
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                        <Form.Item name="profession" label="¿Cuál es tu profesión?">
                            <AutoComplete options={professionOptions} onSearch={handleProfessionSearch} filterOption={false}
                                placeholder="Busca o escribe tu profesión...">
                                <Input prefix={<BulbOutlined />} size="large" />
                            </AutoComplete>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="salesExperience" label="¿Tienes experiencia previa en ventas?" rules={[{ required: true, message: 'Requerido' }]}>
                            <Radio.Group style={{ width: '100%' }}>
                                <Row gutter={12}>
                                    <Col xs={24} sm={12}>
                                        <Radio.Button value="si" style={css.vehicleBtn}>✅&nbsp;&nbsp;Sí, tengo experiencia</Radio.Button>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Radio.Button value="no" style={css.vehicleBtn}>🆕&nbsp;&nbsp;No, soy nuevo en ventas</Radio.Button>
                                    </Col>
                                </Row>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
            </>
        );
    };


    const renderCV = () => (
        <>
            <StepHeading title="Tu Hoja de Vida" subtitle="Último paso — sube tu CV en PDF" />
            <div style={{ ...css.uploadArea, width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                <Upload
                    accept=".pdf"
                    maxCount={1}
                    style={{ width: '100%', display: 'block' }}
                    beforeUpload={(file) => {
                        if (file.type !== 'application/pdf') { message.error('Solo archivos PDF'); return Upload.LIST_IGNORE; }
                        if (file.size > 5 * 1024 * 1024) { message.error('Máximo 5MB'); return Upload.LIST_IGNORE; }
                        setCvFile(file);
                        return false;
                    }}
                    onRemove={() => setCvFile(null)}
                    listType="text"
                >
                    <Button
                        icon={<UploadOutlined />}
                        size="large"
                        style={{
                            width: '100%',
                            height: 'auto',
                            minHeight: 64,
                            fontSize: isMobile ? 14 : 16,
                            borderStyle: 'dashed',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            padding: '12px 16px',
                            boxSizing: 'border-box',
                        }}
                    >
                        {cvFile
                            ? `✅  ${isMobile && cvFile.name.length > 28 ? cvFile.name.slice(0, 25) + '…' : cvFile.name}`
                            : isMobile
                                ? '📄  Toca aquí para subir tu CV (PDF, máx 5MB)'
                                : '📄  Haz clic o arrastra tu CV aquí (PDF, máx 5MB)'}
                    </Button>
                </Upload>
            </div>
        </>
    );

    // ─── Map step index → content ─────────────────────────────────────────
    const getStepContent = () => {
        if (isMobile) {
            // Mobile: granular steps
            const mobileMap: Record<number, React.ReactNode> = {
                0: <MobileStep heading="¿Cómo te llamas?" subheading="Nombre y apellido tal como aparece en tu cédula">
                    <Form.Item name="firstName" label="Nombre(s)" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Ej: Juan Carlos" size="large" />
                    </Form.Item>
                    <Form.Item name="lastName" label="Apellido(s)" rules={[{ required: true, message: 'Requerido' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Ej: González Pérez" size="large" />
                    </Form.Item>
                </MobileStep>,
                1: <MobileStep heading="Tu identificación" subheading="Cédula venezolana y fecha de nacimiento">
                    <Form.Item name="nationalId" label="Cédula de Identidad"
                        rules={[{ required: true, message: 'Requerido' }, { pattern: /^V\d{6,8}$/, message: 'Formato: V12345678' }]}>
                        <Input prefix={<IdcardOutlined />} placeholder="V12345678" maxLength={10} size="large" />
                    </Form.Item>
                    <Form.Item name="birthDate" label="Fecha de Nacimiento" rules={[{ required: true, message: 'Requerido' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large"
                            disabledDate={d => d && d.isAfter(dayjs().subtract(18, 'year'))} />
                    </Form.Item>
                </MobileStep>,
                2: <MobileStep heading="Estado civil y género" subheading="Información personal">
                    <Form.Item name="maritalStatus" label="Estado Civil" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select placeholder="Selecciona..." size="large">
                            {['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión estable'].map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="gender" label="Género" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Radio.Button value="Masculino" style={css.radioBtn}>Masculino</Radio.Button>
                            <Radio.Button value="Femenino" style={css.radioBtn}>Femenino</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </MobileStep>,
                3: <MobileStep heading="¿Tienes hijos?" subheading="">
                    <Form.Item name="hasChildren" label="¿Tiene hijos?" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Radio.Button value="si" style={css.radioBtn}>Sí</Radio.Button>
                            <Radio.Button value="no" style={css.radioBtn}>No</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    {hasChildren && (
                        <Form.Item name="childrenCount" label="¿Cuántos hijos?" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="Selecciona..." size="large">
                                {[1, 2, 3, 4, 5, 6, '7 o más'].map(n => <Option key={String(n)} value={n}>{n}</Option>)}
                            </Select>
                        </Form.Item>
                    )}
                </MobileStep>,
                4: <MobileStep heading="¿Cómo contactarte?" subheading="Correo y teléfono principal">
                    <Form.Item name="email" label="Correo Electrónico"
                        rules={[{ required: true, type: 'email', message: 'Email válido requerido' }]}>
                        <Input prefix={<MailOutlined />} placeholder="tu@correo.com" size="large" />
                    </Form.Item>
                    <Form.Item name="phone" label="Teléfono Principal"
                        rules={[{ required: true, message: 'Requerido' }, { pattern: /^(04\d{2}|02\d{2})\d{7}$/, message: 'Ej: 04141234567' }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="04141234567" maxLength={11} size="large" />
                    </Form.Item>
                </MobileStep>,
                5: <MobileStep heading="¿Otro télefono?" subheading="Opcional, pero nos ayuda a contactarte">
                    <Form.Item name="altPhone" label="Teléfono Alternativo (opcional)">
                        <Input prefix={<PhoneOutlined />} placeholder="04241234567" maxLength={11} size="large" />
                    </Form.Item>
                </MobileStep>,
                6: <MobileStep heading="¿Dónde resides?" subheading="Estado y municipio de Venezuela">
                    <Form.Item name="stateId" label="Estado" rules={[{ required: true, message: 'Requerido' }]}>
                        <Select showSearch placeholder="Selecciona tu estado..." optionFilterProp="children"
                            onChange={handleStateChange} size="large"
                            filterOption={(input, o) => String(o?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                            {VENEZUELA_STATES.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="municipalityId" label="Municipio" rules={[{ required: true, message: 'Selecciona primero el Estado' }]}>
                        <Select showSearch placeholder={selectedStateId ? 'Tu municipio...' : 'Elige el Estado primero'}
                            optionFilterProp="children" disabled={!selectedStateId} size="large"
                            filterOption={(input, o) => String(o?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                            {municipalities.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                        </Select>
                    </Form.Item>
                </MobileStep>,
                7: <MobileStep heading="¿Tienes vehículo?" subheading="Pregunta clave para este cargo">
                    <Form.Item name="hasVehicle" label="¿Tienes vehículo disponible para el trabajo?" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <Radio.Button value="si" style={{ ...css.vehicleBtn, textAlign: 'center' }}>🚗  Sí, tengo vehículo</Radio.Button>
                                <Radio.Button value="no" style={{ ...css.vehicleBtn, textAlign: 'center' }}>🚶  No tengo vehículo</Radio.Button>
                            </div>
                        </Radio.Group>
                    </Form.Item>
                    {hasVehicle === 'si' && (
                        <Form.Item name="vehicleIsOwn" label="¿Ese vehículo es de tu propiedad?" rules={[{ required: true, message: 'Requerido' }]}>
                            <Radio.Group style={{ width: '100%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Radio.Button value="si" style={{ ...css.vehicleBtn, textAlign: 'center' }}>✅  Sí, es mío</Radio.Button>
                                    <Radio.Button value="no" style={{ ...css.vehicleBtn, textAlign: 'center' }}>👥  No, es de un familiar / préstamo</Radio.Button>
                                </div>
                            </Radio.Group>
                        </Form.Item>
                    )}
                    {hasVehicle === 'si' && vehicleIsOwn === 'si' && (
                        <Form.Item name="vehicleDetail" label="Tipo de vehículo" rules={[{ required: true, message: 'Requerido' }]}>
                            <Select placeholder="¿Qué tipo de vehículo?" size="large">
                                {['Moto', 'Carro', 'Camioneta', 'Buseta', 'Otro'].map(v => <Option key={v} value={v}>{v}</Option>)}
                            </Select>
                        </Form.Item>
                    )}
                </MobileStep>,
                8: <MobileStep heading="Tu perfil profesional" subheading="Profesión y experiencia comercial">
                    <Form.Item name="profession" label="¿Cuál es tu profesión?">
                        <AutoComplete options={professionOptions} onSearch={handleProfessionSearch} filterOption={false}
                            placeholder="Busca o escribe tu profesión...">
                            <Input prefix={<BulbOutlined />} size="large" />
                        </AutoComplete>
                    </Form.Item>
                    <Form.Item name="salesExperience" label="¿Experiencia en ventas?" rules={[{ required: true, message: 'Requerido' }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Radio.Button value="si" style={css.radioBtn}>Sí, tengo experiencia</Radio.Button>
                            <Radio.Button value="no" style={css.radioBtn}>No, soy nuevo</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </MobileStep>,
                9: <MobileStep heading="¡Casi listo!" subheading="Sube tu CV en PDF para completar la postulación">
                    {renderCV()}
                </MobileStep>,
            };
            return mobileMap[currentStep] || null;
        }

        // Desktop: section by section
        const desktopMap: Record<number, React.ReactNode> = {
            0: renderPersonalData(),
            1: renderContact(),
            2: renderRequirements(),
            3: renderCV(),
        };
        return desktopMap[currentStep] || null;
    };

    const isLastStep = currentStep === totalSteps - 1;

    // ══════════════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ══════════════════════════════════════════════════════════════════════
    return (
        <div style={css.page}>
            <div style={css.container}>
                {/* Header */}
                <div style={css.header}>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: -0.5 }}>
                        Talentos Comerciales
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 6, display: 'block' }}>
                        Únete a nuestro equipo de ventas — completa el formulario paso a paso
                    </Text>
                </div>

                {/* Steps Indicator — desktop */}
                {!isMobile ? (
                    <div style={css.stepsWrapper}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                            {DESKTOP_STEPS.map((step, idx) => {
                                const isDone = idx < currentStep;
                                const isActive = idx === currentStep;
                                return (
                                    <React.Fragment key={step.title}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                                            borderRadius: 32,
                                            padding: isActive ? '6px 18px' : '6px 14px',
                                            border: isActive ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
                                            transition: 'all 0.3s',
                                        }}>
                                            <span style={{
                                                width: 24, height: 24,
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: isDone ? 14 : 12,
                                                fontWeight: 700,
                                                background: isDone ? '#52c41a' : isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                                                color: isDone ? '#fff' : isActive ? '#0d3b5e' : 'rgba(255,255,255,0.6)',
                                                flexShrink: 0,
                                                transition: 'all 0.3s',
                                            }}>
                                                {isDone ? <CheckCircleOutlined /> : idx + 1}
                                            </span>
                                            <span style={{
                                                color: isDone ? 'rgba(255,255,255,0.75)' : isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                                                fontSize: 13,
                                                fontWeight: isActive ? 700 : 400,
                                                transition: 'all 0.3s',
                                            }}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {idx < DESKTOP_STEPS.length - 1 && (
                                            <div style={{
                                                flex: 1, height: 1,
                                                background: idx < currentStep ? '#52c41a' : 'rgba(255,255,255,0.2)',
                                                minWidth: 24, maxWidth: 60,
                                                transition: 'background 0.4s',
                                            }} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div style={css.progressWrapper}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 6, display: 'block' }}>
                            Paso {currentStep + 1} de {totalSteps}
                        </Text>
                        <Progress
                            percent={progressPercent}
                            showInfo={false}
                            strokeColor={{ from: '#1677ff', to: '#52c41a' }}
                            trailColor="rgba(255,255,255,0.1)"
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                )}

                {/* Form Card */}
                <div style={css.card}>
                    <Form
                        form={form}
                        layout="vertical"
                        requiredMark={false}
                        onValuesChange={(changed) => {
                            if ('hasChildren' in changed) setHasChildren(changed.hasChildren === 'si');
                            if ('hasVehicle' in changed) { setHasVehicle(changed.hasVehicle); setVehicleIsOwn(null); form.setFieldValue('vehicleIsOwn', undefined); }
                            if ('vehicleIsOwn' in changed) setVehicleIsOwn(changed.vehicleIsOwn);
                        }}
                    >
                        {getStepContent()}
                    </Form>

                    <Divider style={{ margin: '24px 0 20px' }} />

                    {/* Navigation — responsive layout */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ flex: isMobile ? '1 1 100%' : '0 0 auto', order: isMobile ? 2 : 1 }}>
                            {currentStep > 0 && (
                                <Button size="large" onClick={handleBack} icon={<ArrowLeftOutlined />} style={{ width: isMobile ? '100%' : 120 }}>
                                    Atrás
                                </Button>
                            )}
                        </div>
                        <div style={{ flex: isMobile ? '1 1 100%' : '0 0 auto', order: isMobile ? 1 : 2 }}>
                            {!isLastStep ? (
                                <Button
                                    type="primary" size="large" onClick={handleNext}
                                    icon={<ArrowRightOutlined />} iconPosition="end"
                                    style={{ width: isMobile ? '100%' : 160, fontWeight: 600 }}
                                >
                                    Continuar
                                </Button>
                            ) : (
                                <Button
                                    type="primary" size="large" loading={loading}
                                    onClick={handleSubmit} icon={<RocketOutlined />}
                                    disabled={!cvFile}
                                    title={!cvFile ? 'Debes subir tu CV para finalizar' : ''}
                                    style={{ minWidth: 180, fontWeight: 700, height: 50 }}
                                >
                                    Enviar Postulación
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Sub-components ──────────────────────────────────────────────────────────
const StepHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, color: '#111', fontWeight: 800 }}>{title}</Title>
        {subtitle && <Text style={{ color: '#666', fontSize: 14, marginTop: 4, display: 'block' }}>{subtitle}</Text>}
    </div>
);

const MobileStep: React.FC<{ heading: string; subheading: string; children: React.ReactNode }> = ({ heading, subheading, children }) => (
    <div>
        <StepHeading title={heading} subtitle={subheading} />
        {children}
    </div>
);

// ── Styles ──────────────────────────────────────────────────────────────────
const css: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d3b5e 55%, #0a2a3b 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 16px 64px',
    },
    container: {
        width: '100%',
        maxWidth: 780,
    },
    header: {
        textAlign: 'center',
        marginBottom: 28,
        paddingTop: 8,
    },
    stepsWrapper: {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        padding: '20px 32px',
        marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.12)',
    },
    progressWrapper: {
        padding: '0 4px',
        marginBottom: 16,
    },
    card: {
        background: '#fff',
        borderRadius: 20,
        padding: '36px 40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
    },
    radioBtn: {
        width: '50%',
        textAlign: 'center',
    },
    vehicleBtn: {
        width: '100%',
        height: 52,
        lineHeight: '50px',
        textAlign: 'center',
        borderRadius: 8,
        marginBottom: 0,
        display: 'block',
    },
    uploadArea: {
        marginTop: 8,
    },
    fullPage: {
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d3b5e 55%, #0a2a3b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    resultCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 480,
        textAlign: 'center',
    },
};

export default RegistrationPage;
