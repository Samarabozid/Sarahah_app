

export const genderEnum = {
    MALE: "male",
    FEMALE: "female"
}

export const roleEnum = {   
    USER: "user",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin"
}

export const privilegesEnum = {
    ADMIN: roleEnum.ADMIN,
    SUPER_ADMIN: roleEnum.SUPER_ADMIN,
    USER: roleEnum.USER,
    ALL:[roleEnum.SUPER_ADMIN,roleEnum.ADMIN,roleEnum.USER],
    ADMINS:[roleEnum.ADMIN,roleEnum.SUPER_ADMIN],
    USER_ADMIN:[roleEnum.USER,roleEnum.ADMIN],
    USER_SUPER_ADMIN:[roleEnum.USER,roleEnum.SUPER_ADMIN],
}