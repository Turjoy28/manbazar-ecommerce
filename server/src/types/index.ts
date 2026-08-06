export interface IUI {
    banner: {
        logo: string;
        title: string;
        bannerImage: string;
        navbarText?: string;
        marqueeText?: string;
    };

    productsCaption: {
        title: string;
    };

    chart: {
        subTitle: string;
        title: string;
        description: string;
        tableTitle: string;
        tableSubTitle: string;

        chartTable: {
            tableTitle: string[];
            tableProperties: string[][];
        };

        chartMeta: {
            title: string;
            cards: {
                logo: string;
                title: string;
                description: string;
            }[];
        };
    };

    specialty: {
        title: string;
        subTitle: string;
        description: string;
        cards: {
            image: string;
            title: string;
            description: string;
        }[];
    };

    footer: {
        shortDescription: string;
        contactInfo: {
            number: string;
            email: string;
            website: string;
        };
        location: string;
        copyright: string;
    };

    theme: {
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor: string;
    };

    cta: {
        title: string;
        subtitle: string;
        buttonText: string;
    };

    chatbot?: {
        messenger?: string;
        facebook?: string;
        tiktok?: string;
        whatsapp?: string;
        youtube?: string;
        instagram?: string;
    };

    categoryLabels: {
        topCategoryLabel: string;
        middleCategoryLabel: string;
        bottomCategoryLabel: string;
    };

    relatedProducts?: {
        title: string;
        subtitle: string;
    };
    deliveryOffer?: {
        minQuantity: number;
        deliveryCharge: number;
        isActive: boolean;
    };

    createdAt?: Date;
    updatedAt?: Date;
}
