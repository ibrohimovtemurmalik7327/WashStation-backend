import userModel from "./user.model";

import db from "../../db/connection";
import config from "../../config/config";

import bcrypt from "bcryptjs";
import { ICreateUserDto, IPublicUser, IUpdateUserDto } from "./user.types";
import { IServiceResponse } from "../../types/common.types";

const BCRYPT_COST = config.bcrypt.cost;

class UserService {

    createUser = async (data: ICreateUserDto): Promise<IServiceResponse<IPublicUser>> => {
        try {
            return db.transaction(async(trx) => {
                const { username, phone, password } = data;

                const existingUsername = await userModel.getUserByUsername(username);
                if (existingUsername) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT'
                    };
                }

                const existingPhone = await userModel.getUserByPhone(phone);
                if (existingPhone) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                }

                const password_hash = await bcrypt.hash(password, BCRYPT_COST);

                const user = await userModel.createUser({
                    username,
                    phone,
                    password_hash
                }, trx);

                if (!user) {
                    return {
                        success: false,
                        error: 'INTERNAL_ERROR'
                    };
                }

                return {
                    success: true,
                    data: user
                };
            })
        } catch (error: any) {
            console.error('UserService.createUser error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT'
                    }
                } 

                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                }
            }
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getUser = async (id: number): Promise<IServiceResponse<IPublicUser>> => {
        try {
                const user = await userModel.getUserById(id);

                if (!user) {
                    return {
                        success: false,
                        error: 'USER_NOT_FOUND'
                    };
                }

                return {
                    success: true,
                    data: user
                };

            } catch (error) {

            console.error('UserService.getUser error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getUsers = async (): Promise<IServiceResponse<IPublicUser[]>> => {
        try {

            const users = await userModel.getUsers();

            return {
                success: true,
                data: users
            };

        } catch (error) {
            console.error('UserService.getUsers error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    updateUser = async (id: number, data: IUpdateUserDto): Promise<IServiceResponse<IPublicUser>> => {
        try {
            return db.transaction(async (trx) => {
                
                const user = await userModel.getUserById(id, trx);
                if (!user) {
                    return {
                        success: false,
                        error: 'USER_NOT_FOUND'
                    };
                }

                if (data.username) {
                    const existingUsername = await userModel.getUserByUsername(data.username);

                    if (existingUsername && existingUsername.id !== id) {
                        return {
                            success: false,
                            error: 'USERNAME_CONFLICT'
                        };
                    }
                }

                if (data.phone) {
                    const existingPhone = await userModel.getUserByPhone(data.phone);

                    if (existingPhone && existingPhone.id !== id) {
                        return {
                            success: false,
                            error: 'PHONE_CONFLICT'
                        };
                    }
                }

                const result = await userModel.updateUser(id, data, trx);

                if (!result) {
                    return {
                        success: false,
                        error: 'INTERNAL_ERROR'
                    };
                }

                return {
                    success: true,
                    data: result
                }
            });
        } catch (error: any) {
            console.error('UserService.updateUser error:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {

                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT'
                    };
                }

                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                }
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    deactivateUser = async (id: number): Promise<IServiceResponse<IPublicUser>> => {
        try {

            const user = await userModel.getUserById(id);

            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND'
                };
            }

            const result = await userModel.deactivateUser(id);

            if (!result) {
                return {
                    success: false,
                    error: 'INTERNAL_ERROR'
                };
            }

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('UserService.deactivateUser error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

}

export default new UserService();
