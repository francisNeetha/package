export interface IAuthexService {
    listInfo(filters: {
        user_id: string;
    }): Promise<{
        secret: string;
    }[]>;
    createInfo(data: {
        user_id: string;
        secret: string;
    }): Promise<any>;
}
