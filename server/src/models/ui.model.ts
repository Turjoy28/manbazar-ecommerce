import mongoose from "mongoose";

const uiSchema = new mongoose.Schema(
    {
        banner: {
            logo: {
                type: String,
                required: true,
            },
            logoText: {
                type: String,
                default: "Manbazar",
            },
            title: {
                type: String,
                required: true,
            },
            bannerImage: {
                type: String,
                required: true,
            },
            navbarText: {
                type: String,
                default: "",
            },
            marqueeText: {
                type: String,
                default: "",
            }
        },
        productsCaption: {
            title: {
                type: String,
                required: true,
            }
        },
        chart: {
            subTitle: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            tableTitle: {
                type: String,
                required: true,
            },
            tableSubTitle: {
                type: String,
                required: true,
            },
            chartTable: {
                tableTitle: [
                    {
                        type: String,
                        required: true,
                    }
                ],
                tableProperties: [
                    [
                        {
                            type: String,
                            required: true,
                        }
                    ]
                ]
            },
            chartMeta: {
                title: {
                    type: String,
                    required: true
                },
                cards: [
                    {
                        logo: {
                            type: String,
                            required: true,
                        },
                        title: {
                            type: String,
                            required: true,
                        },
                        description: {
                            type: String,
                            required: true,
                        }
                    }
                ]
            }
        },
        specialty: {
            title: {
                type: String,
                required: true,
            },
            subTitle: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            cards: [
                {
                    image:{
                        type: String,
                        required: true,
                    },
                    title: {
                        type: String,
                        required: true,
                    },
                    description: {
                        type: String,
                        required: true,
                    }
                }
            ]
        },
        footer: {
            shortDescription: {
                type: String,
                required: true,
            },
            contactInfo: {
                number: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true
                },
                website: {
                    type: String,
                    required: true,
                }
            },
            location: {
                type: String,
                required: true,
            },
            copyright: {
                type: String,
                required: true,
            }
        },
        theme: {
            primaryColor: {
                type: String,
                default: "#e07b39",
            },
            secondaryColor: {
                type: String,
                default: "#111827",
            },
            tertiaryColor: {
                type: String,
                default: "#f97316",
            }
        },
        cta: {
            title: {
                type: String,
                default: "Stay Confident",
            },
            subtitle: {
                type: String,
                default: "Explore our latest collection.",
            },
            buttonText: {
                type: String,
                default: "Order Now",
            }
        },
        chatbot: {
            messenger: {
                type: String,
                default: "",
            },
            facebook: {
                type: String,
                default: "",
            },
            tiktok: {
                type: String,
                default: "",
            },
            whatsapp: {
                type: String,
                default: "",
            },
            youtube: {
                type: String,
                default: "",
            },
            instagram: {
                type: String,
                default: "",
            }
        },
        categoryLabels: {
            topCategoryLabel: {
                type: String,
                default: "Trending Now",
            },
            middleCategoryLabel: {
                type: String,
                default: "Seasonal Essentials",
            },
            bottomCategoryLabel: {
                type: String,
                default: "Clearance & Steals",
            }
        },
        courier: {
            activeProvider: { type: String, enum: ['steadfast', 'pathao', 'redx', 'none'], default: 'none' },
            steadfast: {
                apiKey: { type: String, default: "" },
                apiSecret: { type: String, default: "" },
            },
            pathao: {
                clientId: { type: String, default: "" },
                clientSecret: { type: String, default: "" },
                username: { type: String, default: "" },
                password: { type: String, default: "" },
                storeId: { type: String, default: "" },
            },
            redx: {
                apiKey: { type: String, default: "" },
            }
        }
    },
    { timestamps: true }
);


export const Ui = mongoose.model("ui", uiSchema)