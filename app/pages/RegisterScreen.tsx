import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from '@expo/vector-icons';
import useAuthStore from '@/stores/authStore';
import { UserRegister } from '@/class/UserRegister';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "RegisterUser">;

interface FormErrors {
    nome?: string;
    apelido?: string;
    nomeCompleto?: string;
    dataNascimento?: string;
    email?: string;
    senha?: string;
    confirmarSenha?: string;
}

const RegisterScreen = () => {
    const [form, setForm] = useState({
        nome: '',
        apelido: '',
        nomeCompleto: '',
        dataNascimento: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [securePassword, setSecurePassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

    const authStore = useAuthStore();
    const navigation = useNavigation<NavigationProp>();

    const updateForm = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));

        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateDate = (date: string): boolean => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;

        const [dia, mes, ano] = date.split('/').map(Number);
        const dataObj = new Date(ano, mes - 1, dia);

        return (
            dataObj.getDate() === dia &&
            dataObj.getMonth() === mes - 1 &&
            dataObj.getFullYear() === ano &&
            dataObj <= new Date()
        );
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;


        Object.entries(form).forEach(([key, value]) => {
            if (!value.trim()) {
                newErrors[key as keyof FormErrors] = 'Campo obrigatório';
                isValid = false;
            }
        });


        if (form.email && !validateEmail(form.email)) {
            newErrors.email = 'Email inválido';
            isValid = false;
        }


        if (form.dataNascimento && !validateDate(form.dataNascimento)) {
            newErrors.dataNascimento = 'Data inválida (formato: dd/mm/aaaa)';
            isValid = false;
        }


        if (form.senha && form.senha.length < 6) {
            newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
            isValid = false;
        }


        if (form.senha !== form.confirmarSenha) {
            newErrors.confirmarSenha = 'As senhas não coincidem';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {

            const [dia, mes, ano] = form.dataNascimento.split('/')
            const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
            const user = new UserRegister(form.nome, form.apelido, form.nomeCompleto,
                data, form.email, form.senha);

            await authStore.register(user);

            Alert.alert(
                'Cadastro Realizado',
                'Sua conta foi criada com sucesso!',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Ocorreu um erro ao cadastrar');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDataNascimento = (text: string) => {
        const cleaned = text.replace(/\D/g, '');


        let formatted = '';
        if (cleaned.length <= 2)
            formatted = cleaned;
        else if (cleaned.length <= 4)
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        else
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;

        updateForm('dataNascimento', formatted);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Preencha os campos abaixo para se cadastrar</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informações Pessoais</Text>

                        <View style={styles.flexRow}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Nome</Text>
                                <TextInput
                                    style={[styles.input, errors.nome && styles.inputError]}
                                    placeholder="Seu nome"
                                    placeholderTextColor="#999"
                                    value={form.nome}
                                    onChangeText={(value) => updateForm('nome', value)}
                                />
                                {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Apelido</Text>
                                <TextInput
                                    style={[styles.input, errors.apelido && styles.inputError]}
                                    placeholder="Seu apelido"
                                    placeholderTextColor="#999"
                                    value={form.apelido}
                                    onChangeText={(value) => updateForm('apelido', value)}
                                />
                                {errors.apelido && <Text style={styles.errorText}>{errors.apelido}</Text>}
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <TextInput
                                style={[styles.input, errors.nomeCompleto && styles.inputError]}
                                placeholder="Seu nome completo"
                                placeholderTextColor="#999"
                                value={form.nomeCompleto}
                                onChangeText={(value) => updateForm('nomeCompleto', value)}
                            />
                            {errors.nomeCompleto && <Text style={styles.errorText}>{errors.nomeCompleto}</Text>}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Data de Nascimento</Text>
                            <TextInput
                                style={[styles.input, errors.dataNascimento && styles.inputError]}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor="#999"
                                value={form.dataNascimento}
                                onChangeText={formatDataNascimento}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            {errors.dataNascimento && <Text style={styles.errorText}>{errors.dataNascimento}</Text>}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Credenciais de Acesso</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="seu.email@exemplo.com"
                                placeholderTextColor="#999"
                                value={form.email}
                                onChangeText={(value) => updateForm('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.passwordInput, errors.senha && styles.inputError]}
                                    placeholder="Senha"
                                    placeholderTextColor="#999"
                                    secureTextEntry={securePassword}
                                    value={form.senha}
                                    onChangeText={(value) => updateForm('senha', value)}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setSecurePassword(!securePassword)}
                                >
                                    <Feather name={securePassword ? "eye" : "eye-off"} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                            {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Confirmar Senha</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.passwordInput, errors.confirmarSenha && styles.inputError]}
                                    placeholder="Confirme sua senha"
                                    placeholderTextColor="#999"
                                    secureTextEntry={secureConfirmPassword}
                                    value={form.confirmarSenha}
                                    onChangeText={(value) => updateForm('confirmarSenha', value)}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                                >
                                    <Feather name={secureConfirmPassword ? "eye" : "eye-off"} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Criar Conta</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            Já possui uma conta?{' '}
                            <Text
                                style={styles.link}
                                onPress={() => navigation.navigate('Login')}
                            >
                                Fazer login
                            </Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#121214',
    },
    formContainer: {
        flex: 1,
        padding: 24,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 40,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#a8a8b3',
        marginTop: 8,
        marginBottom: 32,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e1e1e6',
        marginBottom: 16,
    },
    flexRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputWrapper: {
        flex: 1,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#e1e1e6',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#202024',
        borderRadius: 8,
        padding: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#323238',
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff5555',
    },
    errorText: {
        color: '#ff5555',
        fontSize: 12,
        marginTop: 4,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    passwordInput: {
        backgroundColor: '#202024',
        borderRadius: 8,
        padding: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#323238',
        fontSize: 16,
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
    },
    button: {
        backgroundColor: '#8257e5',
        borderRadius: 8,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        backgroundColor: '#6b46c1',
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footerContainer: {
        marginTop: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerText: {
        color: '#a8a8b3',
        fontSize: 14,
    },
    link: {
        color: '#8257e5',
        fontWeight: '600',
    },
});

export default RegisterScreen;