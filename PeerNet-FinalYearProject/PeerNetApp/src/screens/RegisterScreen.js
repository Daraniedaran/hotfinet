import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { registerUser } from '../services/AuthService';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Requester'); // Default role
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            await registerUser(email, password, role);
            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => navigation.replace('Home') }
            ]);
        } catch (error) {
            Alert.alert("Registration Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
                placeholder="Enter Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Enter Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.roleContainer}>
                <Text style={styles.label}>I want to:</Text>
                <View style={styles.roleButtons}>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'Requester' && styles.roleBtnActive]}
                        onPress={() => setRole('Requester')}
                    >
                        <Text style={[styles.roleText, role === 'Requester' && styles.roleTextActive]}>Get Internet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'Provider' && styles.roleBtnActive]}
                        onPress={() => setRole('Provider')}
                    >
                        <Text style={[styles.roleText, role === 'Provider' && styles.roleTextActive]}>Share Internet</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    roleContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600'
    },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roleBtn: {
        flex: 0.48,
        padding: 10,
        borderWidth: 1,
        borderColor: '#2E86DE',
        borderRadius: 8,
        alignItems: 'center',
    },
    roleBtnActive: {
        backgroundColor: '#2E86DE',
    },
    roleText: {
        color: '#2E86DE',
        fontWeight: 'bold'
    },
    roleTextActive: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#10ac84',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    link: {
        marginTop: 20,
        textAlign: 'center',
        color: '#2E86DE',
    }
});

export default RegisterScreen;
