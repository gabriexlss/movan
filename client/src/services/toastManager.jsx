/* eslint-disable react-refresh/only-export-components */
import { Toaster, ToastBar, toast } from 'react-hot-toast'
import { segundosRetryAfter } from '../utils/codeCooldown'

const MESSAGES = {
    TIMEOUT: 'Tempo de requisição esgotado. Tente novamente mais tarde.',
    NO_CONNECTION: 'Não foi possivel realizar conexão com o servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.',
    INTERNAL_SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
    RESOURCE_NOT_FOUND: 'Recurso não encontrado.',
    ACCESS_DENIED: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    INVALID_REQUEST: 'Requisição inválida.',
    INVALID_REQUEST_DATA: 'Dados inválidos enviados ao servidor.',
    ROUTE_NOT_FOUND: 'Rota não encontrada.',
    INVALID_JSON: 'JSON inválido.',
    PAYLOAD_TOO_LARGE: 'Corpo da requisição excede o limite permitido.',
    UNEXPECTED_ERROR: 'Não foi possível concluir a operação.',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
    TOO_MANY_REQUESTS: 'Muitas requisições. Tente novamente mais tarde.',

    PASSWORDS_DIFFERENT: 'As senhas precisam ser iguais.',
    PASSWORDS_DO_NOT_MATCH: 'As senhas não coincidem.',
    PASSWORD_REQUIREMENTS: 'A nova senha deve atender a todos os requisitos.',
    ALL_FIELDS_REQUIRED: 'Por favor, preencha todos os campos.',
    PASSWORD_REQUIRED: 'Por favor, informe sua senha.',
    LOGIN_FAILED: 'Não foi possível realizar o login.',
    INVALID_CREDENTIALS: 'E-mail, CPF, CNPJ ou senha inválidos.',
    LOGIN_INVALID_DATA: 'Dados inválidos para fazer login.',
    LOGIN_SUCCESS: 'Login Realizado com Sucesso.',
    LOGIN_SUCCESS_VERIFICATION_REQUIRED: 'Login Realizado com Sucesso, Mas verificação necessaria para obter os dados.',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso.',

    ACCOUNT_CREATE_INVALID_DATA: 'Dados inválidos para criar a conta.',
    ACCOUNT_CREATED: 'Conta criada com sucesso.',
    ACCOUNT_CREATE_FAILED: 'Não foi possível criar sua conta.',
    ACCOUNT_ALREADY_REGISTERED: 'E-mail, CPF ou CNPJ já cadastrado no Movan.',
    EMAIL_ALREADY_REGISTERED: 'E-mail já cadastrado no Movan.',
    CPF_ALREADY_REGISTERED: 'CPF já cadastrado no Movan.',
    CNPJ_ALREADY_REGISTERED: 'CNPJ já cadastrado no Movan.',
    INVALID_CREDENTIAL: 'Credencial não é nem CPF nem CNPJ',
    INVALID_CPF: 'CPF Inválido.',
    INVALID_CNPJ: 'CNPJ Inválido.',
    INVALID_DOCUMENT: 'CPF ou CNPJ inválido.',
    DOCUMENT_ALREADY_REGISTERED: 'CPF ou CNPJ já cadastrado no Movan.',
    ACCOUNT_DATA_RECEIVED: 'Dados da conta obtidos com sucesso.',
    USER_NOT_FOUND: 'Usuário não encontrado.',
    EMAIL_CHANGE_INVALID_DATA: 'Dados inválidos para alterar o e-mail.',
    EMAIL_UNCHANGED: 'Este já é o seu e-mail atual.',
    EMAIL_REQUIRED: 'Preencha o campo de e-mail.',
    EMAIL_CHANGE_CODE_SENT: 'Código para alteração de e-mail enviado com sucesso.',
    EMAIL_VERIFICATION_CODE_REQUIRED: 'O código é obrigatório para alterar o email.',
    ACCOUNT_DELETE_INVALID_DATA: 'Senha para excluir a conta ausente ou inválida.',
    INVALID_PASSWORD: 'Senha inválida.',
    ACCOUNT_DELETE_SCHEDULED: 'Conta agendada para exclusão. Faça login em até 30 dias para restaurá-la.',
    ACCOUNT_DELETE_FAILED: 'Não foi possível excluir a conta. Por favor, tente novamente mais tarde.',
    ACCOUNT_EDIT_INVALID_DATA: 'Dados inválidos para editar a conta.',
    ACCOUNT_EDIT_REQUIRES_FIELD: 'Informe pelo menos um campo para editar a conta.',
    ACCOUNT_EDITED_ONE_FIELD: '1 campo editado com sucesso.',
    ACCOUNT_EDITED_2_FIELDS: '2 campos editados com sucesso.',
    ACCOUNT_EDITED_3_FIELDS: '3 campos editados com sucesso.',
    ACCOUNT_EDITED_4_FIELDS: '4 campos editados com sucesso.',
    ACCOUNT_VERIFICATION_REQUIRED: 'Sua Conta precisa estar verificada para realizar essa ação.',
    FIELD_UPDATED: 'Campo atualizado com sucesso.',
    FIELD_UPDATE_FAILED: 'Não foi possível atualizar o campo.',
    CURRENT_CNPJ_MISMATCH: 'CNPJ atual não confere.',
    NEW_CNPJ_INVALID_LENGTH: 'CNPJ novo inválido. O CNPJ deve conter 14 caracteres.',
    CURRENT_CNPJ_INVALID_LENGTH: 'CNPJ atual inválido. O CNPJ deve conter 14 caracteres.',
    CNPJ_CHANGED: 'CNPJ alterado com sucesso.',
    CNPJ_CHANGE_FAILED: 'Não foi possível alterar o CNPJ.',

    GOOGLE_TOKEN_MISSING: 'O Google não retornou um token de autenticação.',
    GOOGLE_DATA_NOT_FOUND: 'Não foi possível recuperar os dados da conta Google.',
    GOOGLE_AUTH_FAILED: 'Não foi possível autenticar com o Google.',
    GOOGLE_AUTH_INVALID_DATA: 'Dados Inválidos para autenticar com o google.',
    GOOGLE_TOKEN_INVALID: 'Token do Google inválido, expirado ou corrompido.',
    GOOGLE_EMAIL_NOT_VERIFIED: 'Email do Google não verificado.',
    GOOGLE_LOGIN_SUCCESS: 'Login realizado com sucesso.',
    GOOGLE_ACCOUNT_NOT_LINKED: 'Conta Encontrada, mas não vinculada ao google.',
    GOOGLE_ACCOUNT_CREATION_REQUIRED: 'Conta não encontrada. iniciando criação de conta com o google.',
    GOOGLE_ACCOUNT_CREATE_INVALID_DATA: 'Dados Inválidos para criação da conta.',
    GOOGLE_ACCOUNT_ALREADY_LINKED: 'Esta conta do Google já está vinculada a outro usuário.',
    GOOGLE_ACCOUNT_ALREADY_REGISTERED: 'E-mail, CPF, CNPJ ou Conta Google já cadastrado no Movan.',
    GOOGLE_ACCOUNT_CREATE_FAILED: 'Não foi possível criar sua conta Google.',
    GOOGLE_LINK_INVALID_DATA: 'Dados Inválidos para vincular sua conta google.',
    GOOGLE_LINK_FAILED: 'Não foi possível vincular a conta Google.',
    GOOGLE_OPEN_FAILED: 'Não foi possível abrir o Google.',
    GOOGLE_ACCOUNT_LINKED: 'Conta vinculada ao google com sucesso.',
    GOOGLE_ACCOUNT_UNLINKED: 'Conta Google Desvinculada com Sucesso.',

    VERIFICATION_CODE_TYPE_MISSING: 'O tipo do código não foi informado.',
    VERIFICATION_CODE_TYPE_INVALID: 'Tipo de código inválido.',
    VERIFICATION_CODE_SENT: 'Código de verificação enviado com sucesso.',
    VERIFICATION_CODE_SEND_FAILED: 'Não foi possível enviar o código.',
    VERIFICATION_CODE_RESENT: 'Código de verificação reenviado com sucesso.',
    VERIFICATION_CODE_RESEND_FAILED: 'Não foi possível reenviar o código.',
    VERIFICATION_CODE_FORMAT: 'Digite um código válido com seis dígitos.',
    VERIFICATION_CODE_INVALID_OR_EXPIRED: 'Código inválido ou expirado.',
    VERIFICATION_CODE_INVALID_DATA: 'Dados inválidos para verificar a conta.',
    VERIFICATION_CODE_VALIDATION_FAILED: 'Não foi possível validar o código.',
    ACCOUNT_ALREADY_VERIFIED: 'Conta já verificada.',
    ACCOUNT_VERIFIED: 'Conta verificada com sucesso.',

    RECOVERY_CODE_SENT: 'Código de recuperação enviado com sucesso.',
    RECOVERY_CODE_RESENT: 'Código reenviado com sucesso.',
    PASSWORD_RECOVERY_INVALID_DATA: 'Dados inválidos para recuperação de senha.',
    ACCOUNT_NOT_FOUND_BY_EMAIL: 'Nenhuma conta encontrada com o e-mail informado.',
    RECOVERY_CODE_REQUIRED: 'Solicite um novo código de recuperação.',
    PASSWORD_CHANGED: 'Senha alterada com sucesso.',
    PASSWORD_CHANGE_FAILED: 'Não foi possível alterar a senha.',

    AUTH_REQUIRED: 'Acesso negado. Faça login para continuar.',
    NOT_STRING: 'Não é uma String',
    EMAIL_TOO_SHORT: 'Email muito curto',
    EMAIL_TOO_LONG: 'Email Muito Longo',
    EMAIL_INVALID: 'Email Invalido',
    NAME_TOO_SHORT: 'Nome muito Curto',
    NAME_TOO_LONG: 'Nome muito Longo',
    PASSWORD_TOO_LONG: 'Senha muito Longa',
    PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 8 caracteres.',
    PASSWORD_UPPERCASE_REQUIRED: 'A senha deve conter uma letra maiúscula.',
    PASSWORD_LOWERCASE_REQUIRED: 'A senha deve conter uma letra minúscula.',
    PASSWORD_NUMBER_REQUIRED: 'A senha deve conter um número.',
    PASSWORD_SPECIAL_REQUIRED: 'A senha deve conter um caractere especial.',
    CURRENT_PASSWORD_REQUIRED: 'A confirmação da senha é obrigatória para alterar a senha.',
    LOGIN_TOO_SHORT: 'Credenciais de Login muito curtas',
    LOGIN_TOO_LONG: 'Credenciais de Login muito longas',
    GOOGLE_TOKEN_REQUIRED: 'Token não pode estar vazio.',
    GOOGLE_NAME_REQUIRED: 'Nome não pode estar vazio.',
    GOOGLE_EMAIL_REQUIRED: 'Email não pode estar vazio',
    GOOGLE_EMAIL_INVALID: 'tem que ser um email valido',
    GOOGLE_ID_REQUIRED: 'id não pode estar vazio.',
    VERIFICATION_CODE_NOT_STRING: 'O Codigo Não é uma String',
    VERIFICATION_CODE_INVALID_LENGTH: 'O Código tem que ter exatamente 6 digitos',
    AUTH_EXCLUDED_ACCOUNT: 'Não é possível obter dados de uma conta excluída.',
    PASSWORD_COMPARISON_INVALID_DATA: 'Digite uma senha válida para comparar.',
    PASSWORD_COMPARISON_SUCCESS: 'Senha comparada com sucesso.',
    NOT_BOOLEAN: 'O valor deve ser um booleano.',
    INVALID_DATE: 'Data inválida.',
    STATUS_REQUIRED: 'Status ausente.',
    MESSAGE_REQUIRED: 'Mensagem ausente.',
    SUCCESS_REQUIRED: 'Sucesso ausente.',
}

const getMessage = (messageCode, fallbackCode = 'UNEXPECTED_ERROR') => {
    return MESSAGES[messageCode] || MESSAGES[fallbackCode] || MESSAGES.UNEXPECTED_ERROR
}

const getResponseMessageCode = (response) => {
    return response?.data?.['msg-code']
}

const getFieldErrorCodes = (error) => {
    return Object.values(error.response?.data?.erro || {})
        .flatMap((field) => field?._errors || [])
}

const successToast = (messageCode) => {
    return toast.success(getMessage(messageCode), {
        id: `success:${messageCode}`,
    })
}

const errorToast = (messageCode) => {
    return toast.error(getMessage(messageCode), {
        id: `error:${messageCode}`,
    })
}

const responseSuccessToast = (response, fallbackCode) => {
    const responseCode = getResponseMessageCode(response)
    const messageCode = MESSAGES[responseCode] ? responseCode : fallbackCode

    return successToast(messageCode)
}

const apiErrorToast = (error, fallbackCode) => {
    if (error.code === 'ECONNABORTED') {
        return errorToast('TIMEOUT')
    }

    if (!error.response) {
        return errorToast('NO_CONNECTION')
    }

    const fieldErrorCodes = getFieldErrorCodes(error)

    if (fieldErrorCodes.length > 0) {
        const message = fieldErrorCodes
            .map((messageCode) => getMessage(messageCode, fallbackCode))
            .join(' ')

        return toast.error(message, {
            id: `error:${fieldErrorCodes.join(':')}`,
        })
    }

    const responseCode = getResponseMessageCode(error.response)
    const messageCode = MESSAGES[responseCode] ? responseCode : fallbackCode

    if (error.response.status === 429) {
        const seconds = segundosRetryAfter(error.response.headers)
        const message = seconds === null
            ? getMessage(messageCode)
            : `${getMessage(messageCode)} Aguarde ${seconds} segundos antes de tentar novamente.`

        return toast.error(message, {
            id: `error:${messageCode}:rate-limit`,
        })
    }

    return errorToast(messageCode)
}

const globalApiErrorToast = (error) => {
    if (error.code === 'ECONNABORTED') {
        return errorToast('TIMEOUT')
    }

    if (!error.response) {
        return errorToast('NO_CONNECTION')
    }

    const status = error.response.status

    if (status === 500) return errorToast('INTERNAL_SERVER_ERROR')
    if (status === 401) {
        return error.config?.skipAuthExpired
            ? apiErrorToast(error, 'INVALID_CREDENTIALS')
            : errorToast('SESSION_EXPIRED')
    }
    if (status === 404) return apiErrorToast(error, 'RESOURCE_NOT_FOUND')
    if (status === 403) return apiErrorToast(error, 'ACCESS_DENIED')
    if (status === 429) return apiErrorToast(error, 'TOO_MANY_REQUESTS')

    if (status === 400) {
        const fieldErrorCodes = getFieldErrorCodes(error)
        const responseCode = getResponseMessageCode(error.response)
        const messageCodes = fieldErrorCodes.length > 0
            ? fieldErrorCodes
            : [MESSAGES[responseCode] ? responseCode : 'INVALID_REQUEST_DATA']
        const message = `${MESSAGES.INVALID_REQUEST} ${messageCodes
            .map((messageCode) => getMessage(messageCode, 'INVALID_REQUEST_DATA'))
            .join(' ')}`

        return toast.error(message, {
            id: `error:invalid-request:${messageCodes.join(':')}`,
        })
    }

    return undefined
}

const AppToaster = () => {
    return (
        <Toaster position="top-right" toastOptions={{ duration: 6000 }}>
            {(currentToast) => (
                <div
                    onTouchEnd={() => toast.dismiss(currentToast.id)}
                    style={{ pointerEvents: 'auto' }}
                >
                    <ToastBar toast={currentToast} />
                </div>
            )}
        </Toaster>
    )
}

export {
    AppToaster,
    apiErrorToast,
    errorToast,
    globalApiErrorToast,
    responseSuccessToast,
    successToast,
}
