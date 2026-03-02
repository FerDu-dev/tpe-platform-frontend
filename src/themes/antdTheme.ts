import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#2b457c',
        borderRadius: 6,
        colorError: '#f5222d',
        colorWarning: '#faad14',
        colorSuccess: '#52c41a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Layout: {
            headerBg: '#ffffff',
            siderBg: '#2b457c',
            bodyBg: '#f0f2f5',
        },
        Table: {
            headerBg: '#fafafa',
        },
        Card: {
            borderRadiusLG: 8,
        },
    },
};
