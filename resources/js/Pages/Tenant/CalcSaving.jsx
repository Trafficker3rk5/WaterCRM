import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const CONDITIONS_HTML = `<p><b>Condiciones de venta:</b></p>
<p><b>- Pago único: </b>El equipo será enviado a su domicilio en un plazo máximo de 5 días hábiles.</p>
<p><b>- Pago a plazos:</b> Para asegurar una buena instalación y un buen mantenimiento, se incluye la instalación y los mantenimientos durante el plazo escogido en la opción de pago a plazos. Siendo Aquaam el responsable del buen funcionamiento del equipo.<br><br>
<b>- 4 años de garantía.</b> El equipo unicamente puede ser manipulado por un servicio técnico autorizado por Aquaam. En caso contrario, el equipo perderá la garantía. Durante el periodo de garantia, no se incluye cualquier tipo de reparación ajena a defecto de fabricación o debido a la instalación. Esta excluido de la garantía, subidas de tensión eléctrica, aumento de presión del agua, rotura del equipo por falta de suministro de agua, mala instalación.</p>
<br>
<p><b>- Mantenimientos:</b> Incluye: higienización con peróxido de hidrógeno, reemplazo de filtros (siempre y cuando por uso o tiempo sea preciso) y mantenimiento del equipo (durante el periodo de garantía, incluye cambio de piezas sin coste).</p>`;

const getAsset = (file) => new URL(`../../../assets/images/calc-saving/${file}`, import.meta.url).href;

const ICONS = {
    bottles: getAsset('ic_bottles.webp'),
    kg: getAsset('ic_kg.webp'),
    co2: getAsset('ic_co2.webp'),
    coins: getAsset('ic_coins.webp'),
    money: getAsset('ic_give_money.webp'),
    saving: getAsset('ic_advantages_06.webp'),
};

const FALLBACK_IMAGE = getAsset('no-image.png');

const normalizeImageUrl = (url) => {
    if (!url) return '';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    try {
        const parsed = new URL(url, currentOrigin || undefined);

        if (currentOrigin && parsed.origin !== currentOrigin) {
            return `${currentOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }

        return parsed.href;
    } catch (error) {
        if (!currentOrigin) {
            return url;
        }

        const leadingSlash = url.startsWith('/') ? '' : '/';
        return `${currentOrigin}${leadingSlash}${url}`;
    }
};

const SELECTION_STEPS = new Set(['products', 'dues', 'extras']);
const PROGRESS_PHASES = ['Formulario', 'Selección', 'Resultado'];

const QuestionBlock = ({ title, subtitle, inline = false, children }) => (
    <div className="conf-step appear">
        <div className="row">
            <div className="col-12 z-index-3">
                <div className="quest-title">
                    <h3>{title}</h3>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                <div className={`quest-answers ${inline ? 'answers-inline' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const ConfButton = ({ label, variant = 'default', className = '', ...props }) => (
    <button type="button" className={`conf-btn ${variant === 'light' ? 'conf-btn-lt' : ''} ${className}`} {...props}>
        <span>{label}</span>
    </button>
);

const formatCurrency = (value) => {
    const number = Number(value ?? 0);
    if (Number.isNaN(number)) return '0,00 €';
    return `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)} €`;
};

const CalcSaving = ({ auth, products = [], brands = [] }) => {
    const [step, setStep] = useState('scope');
    const [flags, setFlags] = useState({
        homeSelected: false,
        companySelected: false,
        bottledWaterSelected: false,
        brandSelected: false,
        otherSelected: false,
        otherWaterSelected: false,
        aquaserviceBrandSelected: false,
        fountainWithBottleSelected: false,
    });
    const [answers, setAnswers] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedDue, setSelectedDue] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const brandOptions = useMemo(() => brands.filter((brand) => brand.type === 0), [brands]);
    const aquaserviceBrand = useMemo(() => brands.find((brand) => brand.type === 1), [brands]);

    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (document.querySelector('script[data-lottie-player="true"]')) return;
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
        script.async = true;
        script.dataset.lottiePlayer = 'true';
        document.body.appendChild(script);
    }, []);

    const phase = SELECTION_STEPS.has(step) ? 1 : step === 'result' ? 2 : 0;
    const progressPercent = (phase / (PROGRESS_PHASES.length - 1)) * 100;

    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const resetFlow = () => {
        setFlags({
            homeSelected: false,
            companySelected: false,
            bottledWaterSelected: false,
            brandSelected: false,
            otherSelected: false,
            otherWaterSelected: false,
            aquaserviceBrandSelected: false,
            fountainWithBottleSelected: false,
        });
        setAnswers({});
        setSelectedProduct(null);
        setSelectedDue(null);
        setSelectedExtras([]);
        setResult(null);
        setStep('scope');
        scrollToTop();
    };

    const goToStep = (nextStep) => {
        scrollToTop();
        setStep(nextStep);
    };

    const updateFlag = (key, value) => {
        setFlags((prev) => ({ ...prev, [key]: value }));
    };

    const updateAnswer = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const handleScope = (scope) => {
        updateAnswer('scope', scope);
        if (scope === 'home') {
            updateFlag('homeSelected', true);
            goToStep('household');
        } else {
            updateFlag('companySelected', true);
            goToStep('employees');
        }
    };

    const handleWaterType = (type) => {
        updateAnswer('waterType', type);
        if (type === 'Agua embotellada') {
            updateFlag('bottledWaterSelected', true);
            goToStep('brand');
        } else if (type === 'Otro') {
            updateFlag('otherWaterSelected', true);
            goToStep('monthlyExpenseHome');
        } else {
            goToStep('products');
        }
    };

    const handleBrandSelection = (brandId) => {
        updateFlag('brandSelected', true);
        updateAnswer('brandId', brandId);
        goToStep('liters');
    };

    const handleOtherBrand = () => {
        updateFlag('otherSelected', true);
        goToStep('bottlesPerMonth');
    };

    const handleAquaserviceHome = () => {
        updateFlag('aquaserviceBrandSelected', true);
        goToStep('aquaservicePlanHome');
    };

    const handleCompanyService = (service) => {
        switch (service) {
            case 'Aquaservice':
                updateFlag('aquaserviceBrandSelected', true);
                goToStep('garrafas');
                break;
            case 'Fuente':
                updateFlag('fountainWithBottleSelected', true);
                goToStep('garrafas');
                break;
            case 'Otro':
                updateFlag('otherSelected', true);
                goToStep('monthlyExpenseCompany');
                break;
            default:
                goToStep('products');
                break;
        }
    };

    const determineCase = () => {
        if (flags.bottledWaterSelected) {
            if (flags.otherSelected) return 1;
            if (flags.brandSelected) return 3;
            if (flags.aquaserviceBrandSelected) return 4;
        }

        if (flags.otherWaterSelected) {
            return 2;
        }

        if (flags.aquaserviceBrandSelected) {
            if (flags.companySelected) {
                if (answers.dispensers && answers.pricePerDelivery) {
                    return 5;
                }
                return 4;
            }
            return 4;
        }

        if (flags.fountainWithBottleSelected) {
            if (answers.dispensers && answers.pricePerDelivery) {
                return 7;
            }
            return 6;
        }

        return 0;
    };

    const filteredProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

    const priceList = useMemo(() => {
        if (!selectedProduct) return [];
        const dataset = answers.scope === 'home'
            ? selectedProduct?.home_prices || []
            : selectedProduct?.business_prices || [];
        return [...dataset].sort((a, b) => {
            if ((a?.duties ?? 0) === 1 && (b?.duties ?? 0) !== 1) return 1;
            if ((a?.duties ?? 0) !== 1 && (b?.duties ?? 0) === 1) return -1;
            return (a?.duties ?? 0) - (b?.duties ?? 0);
        });
    }, [selectedProduct, answers.scope]);

    const extrasList = selectedProduct?.extras || [];

    const selectedExtrasDetails = useMemo(() => {
        if (!extrasList.length || !selectedExtras.length) return [];
        return selectedExtras
            .map((key) => extrasList[Number(key)])
            .filter(Boolean);
    }, [extrasList, selectedExtras]);

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSelectedDue(null);
        setSelectedExtras([]);
        setResult(null);
        goToStep('dues');
    };

    const proceedToResult = (dueValue) => {
        const effectiveDue = dueValue ?? selectedDue;
        if (!selectedProduct || !effectiveDue) {
            toast.error('Selecciona un producto y una forma de pago');
            return;
        }
        handleCalculate(effectiveDue);
    };

    const handleDueSelect = (due) => {
        setSelectedDue(due);
        updateAnswer('due', due);
        if (extrasList.length) {
            goToStep('extras');
        } else {
            proceedToResult(due);
        }
    };

    const toggleExtra = (index) => {
        const key = String(index);
        setSelectedExtras((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    const handleCalculate = async (dueOverride) => {
        const effectiveDue = dueOverride ?? selectedDue;
        if (!selectedProduct || !effectiveDue) {
            toast.error('Selecciona un producto y una forma de pago');
            return;
        }

        const calcCase = determineCase();
        const payload = {
            product_id: selectedProduct.id,
            home: answers.scope === 'home' ? 'home' : 'company',
            case: calcCase,
            due: Number(effectiveDue || answers.due || 0),
            // WP expects extras as comma-separated indices
            extras: selectedExtras.join(','),
        };

        // Populate case-specific fields to mirror WP plugin logic
        if (calcCase === 1) {
            payload.bottles = answers.otherBrandBottles;
            payload.monthly_expense = answers.monthlyExpense;
        } else if (calcCase === 2) {
            payload.monthly_expense = answers.monthlyExpense;
        } else if (calcCase === 3) {
            payload.liters = answers.liters;
            payload.brand = answers.brandId;
            payload.people = answers.people;
        } else if (calcCase === 4) {
            // Aquaservice flows: WP expects aquaservice_plan.
            // Company flow may store it as 'plan' from the 'garrafas' step; use either.
            payload.aquaservice_plan = answers.aquaservicePlan ?? answers.plan;
        } else if (calcCase === 5 || calcCase === 7) {
            // WP uses monthly_expense here for dispenser flows; map pricePerDelivery if present
            payload.dispensers = answers.dispensers;
            payload.monthly_expense = answers.pricePerDelivery ?? 0;
        } else if (calcCase === 6) {
            payload.plan = answers.plan;
        }

        setSubmitting(true);
        try {
            const { data } = await axios.post('/calculator/calculate', payload);
            let apiResult = data.result || {};

            // Re-align with WP calculations for display if needed
            const calcCaseForDisplay = calcCase;
            // Get aqua price from current selection (matching due)
            const matchedDue = Number(effectiveDue || 0);
            const dutyPrice = (priceList.find((p) => Number(p.duties) === matchedDue)?.price)
                ?? (priceList[0]?.price);
            const aquaPriceNum = Number(dutyPrice ?? 0);

            // Compute current monthly price when WP would
            let currentMonthlyPriceNum = 0;
            if (calcCaseForDisplay === 1 || calcCaseForDisplay === 2) {
                currentMonthlyPriceNum = Number(answers.monthlyExpense ?? 0);
            } else if (calcCaseForDisplay === 3) {
                const liters = Number(answers.liters ?? 0);
                const people = Number(answers.people ?? 0);
                const selectedBrandId = Number(answers.brandId ?? 0);
                const brand = brands.find((b) => Number(b.id) === selectedBrandId);
                const brandPerBottle = Number(
                    Array.isArray(brand?.prices) && brand.prices[0]?.price ? brand.prices[0].price : 0
                );
                const bottlesPerMonth = (liters * people) / 1.5 * 30; // WP logic
                currentMonthlyPriceNum = brandPerBottle * bottlesPerMonth;
            } else if (calcCaseForDisplay === 5 || calcCaseForDisplay === 7) {
                currentMonthlyPriceNum = Number(answers.pricePerDelivery ?? 0);
            } else {
                currentMonthlyPriceNum = Number(apiResult.price?.toString().replace(/[^\d.,-]/g, '').replace('.', '').replace(',', '.') ?? 0) || 0;
            }

            // Extras sum (one-time, subtracted once like WP)
            const extrasSum = selectedExtrasDetails.reduce((sum, extra) => sum + Number(extra.price ?? 0), 0);

            // WP saving formula
            const savingNum = currentMonthlyPriceNum * 12 * 5 - aquaPriceNum * matchedDue - extrasSum;

            // Prepare formatted strings
            const formattedPrice = formatCurrency(currentMonthlyPriceNum);
            const formattedAqua = formatCurrency(aquaPriceNum);
            const formattedSaving = formatCurrency(savingNum);

            // Merge/override for display parity with WP
            apiResult = {
                ...apiResult,
                due: matchedDue,
                price: formattedPrice,
                aqua_price: formattedAqua,
                saving_price: formattedSaving,
            };

            setResult(apiResult);
            goToStep('result');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo calcular el ahorro');
        } finally {
            setSubmitting(false);
        }
    };

    const renderScopeStep = () => (
        <QuestionBlock title="¿Dónde quieres instalar tu dispensador?">
            <div className="quest-answer">
                <ConfButton label="Empresa" onClick={() => handleScope('company')} />
            </div>
            <div className="quest-answer">
                <ConfButton label="Hogar" onClick={() => handleScope('home')} />
            </div>
        </QuestionBlock>
    );

    const renderHouseholdStep = () => (
        <QuestionBlock title="¿Cuantos sois en casa?">
            {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="quest-answer" key={num}>
                    <ConfButton
                        label={num === 6 ? '6 o más' : String(num)}
                        onClick={() => {
                            updateAnswer('people', num === 6 ? 6 : num);
                            goToStep('waterType');
                        }}
                    />
                </div>
            ))}
        </QuestionBlock>
    );

    const renderWaterTypeStep = () => (
        <QuestionBlock title="¿Como bebéis agua en casa?">
            {['Grifo', 'Agua embotellada', 'Osmosis', 'Otro'].map((option) => (
                <div className="quest-answer" key={option}>
                    <ConfButton label={option} onClick={() => handleWaterType(option)} />
                </div>
            ))}
        </QuestionBlock>
    );

    const renderBrandStep = () => (
        <QuestionBlock title="¿Qué marca consumes?">
            {brandOptions.map((brand) => (
                <div className="quest-answer" key={brand.id}>
                    <ConfButton label={brand.brand} onClick={() => handleBrandSelection(brand.id)} />
                </div>
            ))}
            {aquaserviceBrand && (
                <div className="quest-answer">
                    <ConfButton label="Aquaservice" onClick={handleAquaserviceHome} />
                </div>
            )}
            <div className="quest-answer">
                <ConfButton label="Otra" onClick={handleOtherBrand} />
            </div>
        </QuestionBlock>
    );

    const renderBottlesStep = () => (
        <QuestionBlock title="¿Cuántas botellas de 1,5L consumen al mes?" inline>
            <div className="quest-answer">
                <input
                    type="number"
                    className="form-control fit-width"
                    value={answers.otherBrandBottles ?? ''}
                    onChange={(e) => updateAnswer('otherBrandBottles', e.target.value)}
                    placeholder="Número de botellas al mes"
                />
            </div>
            <div className="quest-answer">
                <ConfButton
                    label="Siguiente"
                    onClick={() => {
                        if (!answers.otherBrandBottles) {
                            toast.error('Introduce una cantidad');
                            return;
                        }
                        goToStep('monthlyExpenseHome');
                    }}
                />
            </div>
        </QuestionBlock>
    );

    const renderMonthlyExpenseHome = () => (
        <QuestionBlock title="¿Cuánto pagas al mes?" inline>
            <div className="quest-answer">
                <input
                    type="number"
                    className="form-control fit-width"
                    value={answers.monthlyExpense ?? ''}
                    onChange={(e) => updateAnswer('monthlyExpense', e.target.value)}
                    placeholder="€"
                />
            </div>
            <div className="quest-answer">
                <ConfButton
                    label="Siguiente"
                    onClick={() => {
                        if (!answers.monthlyExpense) {
                            toast.error('Introduce un importe');
                            return;
                        }
                        goToStep('products');
                    }}
                />
            </div>
        </QuestionBlock>
    );

    const renderLitersStep = () => (
        <QuestionBlock title="¿Cuántos litros consumes al día por persona?">
            {[1, 2, 3, 4].map((liters) => (
                <div className="quest-answer" key={liters}>
                    <ConfButton
                        label={`${liters} L`}
                        onClick={() => {
                            updateAnswer('liters', liters);
                            goToStep('products');
                        }}
                    />
                </div>
            ))}
            <div className="quest-answer">
                <ConfButton
                    label="No lo sé"
                    onClick={() => {
                        updateAnswer('liters', 2);
                        goToStep('products');
                    }}
                />
            </div>
        </QuestionBlock>
    );

    const renderAquaservicePlanHome = () => (
        <QuestionBlock title="¿Cuántas garrafas de 20L recibes en cada reparto?">
            {[2, 3, 4, 5, 6, 7, 8].map((plan) => (
                <div className="quest-answer" key={plan}>
                    <ConfButton
                        label={String(plan)}
                        onClick={() => {
                            updateAnswer('aquaservicePlan', plan);
                            goToStep('products');
                        }}
                    />
                </div>
            ))}
        </QuestionBlock>
    );

    const renderEmployeesStep = () => (
        <QuestionBlock title="¿Cuántos empleados sois?">
            {['1-5', '6-15', '16-25', 'Más de 25'].map((label) => (
                <div className="quest-answer" key={label}>
                    <ConfButton label={label} onClick={() => goToStep('serviceType')} />
                </div>
            ))}
        </QuestionBlock>
    );

    const renderServiceTypeStep = () => (
        <QuestionBlock title="¿Tenéis algún tipo de servicio de agua?">
            <div className="quest-answer">
                <ConfButton label="Aquaservice" onClick={() => handleCompanyService('Aquaservice')} />
            </div>
            <div className="quest-answer">
                <ConfButton label="Fuente con garrafa" onClick={() => handleCompanyService('Fuente')} />
            </div>
            <div className="quest-answer">
                <ConfButton label="Otro" onClick={() => handleCompanyService('Otro')} />
            </div>
            <div className="quest-answer">
                <ConfButton label="No" onClick={() => handleCompanyService('No')} />
            </div>
        </QuestionBlock>
    );

    const renderGarrafasStep = () => (
        <QuestionBlock title="¿Cuántas garrafas de 20L le traen en cada reparto?">
            {[2, 3, 4, 5, 6, 7, 8].map((plan) => (
                <div className="quest-answer" key={plan}>
                    <ConfButton
                        label={String(plan)}
                        onClick={() => {
                            updateAnswer('plan', plan);
                            goToStep('dispensers');
                        }}
                    />
                </div>
            ))}
        </QuestionBlock>
    );

    const renderDispensersStep = () => (
        <QuestionBlock title="¿Cuántos dispensadores tenéis en la empresa?">
            {['1', 'Más de 1', 'No lo sé'].map((option, index) => (
                <div className="quest-answer" key={option}>
                    <ConfButton
                        label={option}
                        onClick={() => {
                            const value = index === 0 ? 1 : index === 1 ? 2 : 0;
                            updateAnswer('dispensers', value);
                            goToStep('pricePerDelivery');
                        }}
                    />
                </div>
            ))}
        </QuestionBlock>
    );

    const renderPricePerDeliveryStep = () => (
        <QuestionBlock title="Para calcular tu ahorro, necesitamos saber cuanto pagas por reparto." inline>
            <div className="quest-answer">
                <input
                    type="number"
                    className="form-control fit-width"
                    value={answers.pricePerDelivery ?? ''}
                    onChange={(e) => updateAnswer('pricePerDelivery', e.target.value)}
                    placeholder="X €"
                />
            </div>
            <div className="quest-answer">
                <ConfButton
                    label="No lo sé"
                    variant="light"
                    onClick={() => {
                        updateAnswer('pricePerDelivery', 0);
                        goToStep('products');
                    }}
                />
            </div>
            <div className="quest-answer">
                <ConfButton
                    label="Siguiente"
                    onClick={() => {
                        if (!answers.pricePerDelivery) {
                            toast.error('Introduce un importe');
                            return;
                        }
                        goToStep('products');
                    }}
                />
            </div>
        </QuestionBlock>
    );

    const renderMonthlyExpenseCompanyStep = () => (
        <QuestionBlock title="¿Cuánto pagas al mes?" inline>
            <div className="quest-answer">
                <input
                    type="number"
                    className="form-control fit-width"
                    value={answers.monthlyExpense ?? ''}
                    onChange={(e) => updateAnswer('monthlyExpense', e.target.value)}
                    placeholder="€"
                />
            </div>
            <div className="quest-answer">
                <ConfButton
                    label="Siguiente"
                    onClick={() => {
                        if (!answers.monthlyExpense) {
                            toast.error('Introduce un importe');
                            return;
                        }
                        goToStep('products');
                    }}
                />
            </div>
        </QuestionBlock>
    );

    const renderQuestionContent = () => {
        switch (step) {
            case 'scope':
                return renderScopeStep();
            case 'household':
                return renderHouseholdStep();
            case 'waterType':
                return renderWaterTypeStep();
            case 'brand':
                return renderBrandStep();
            case 'bottlesPerMonth':
                return renderBottlesStep();
            case 'monthlyExpenseHome':
                return renderMonthlyExpenseHome();
            case 'liters':
                return renderLitersStep();
            case 'aquaservicePlanHome':
                return renderAquaservicePlanHome();
            case 'employees':
                return renderEmployeesStep();
            case 'serviceType':
                return renderServiceTypeStep();
            case 'garrafas':
                return renderGarrafasStep();
            case 'dispensers':
                return renderDispensersStep();
            case 'pricePerDelivery':
                return renderPricePerDeliveryStep();
            case 'monthlyExpenseCompany':
                return renderMonthlyExpenseCompanyStep();
            default:
                return renderScopeStep();
        }
    };

    const renderProductsGrid = () => (
        <Fragment>
            <div className="quest-title col-12 z-index-3">
                <h3>¿Que opción prefieres?</h3>
                <p>Selecciona el equipo que mejor se adapta a tus necesidades.</p>
            </div>
            <div className="col pt-1 pb-5 mb-5 d-flex">
                <div className="waas-products-grid">
                    {filteredProducts.length ? (
                        filteredProducts.map((product) => {
                            const homePrice = product?.home_prices?.[0]?.price;
                            const businessPrice = product?.business_prices?.[0]?.price;
                            return (
                                <div
                                    className="waas-product"
                                    key={product.id}
                                    data-pk={product.id}
                                >
                                    <div className="waas-product-image">
                                        <img
                                            src={normalizeImageUrl(product.main_image) || FALLBACK_IMAGE}
                                            alt={product.model || product.name}
                                            onError={(e) => {
                                                e.currentTarget.src = FALLBACK_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="waas-product-info">
                                        <h3>{product.model || product.name}</h3>
                                        <p className="price_home">
                                            Precio hogar: {homePrice ? formatCurrency(homePrice) : 'Consultar'}
                                        </p>
                                        <p className="price_business">
                                            Precio empresa: {businessPrice ? formatCurrency(businessPrice) : 'Consultar'}
                                        </p>
                                        <a
                                            className="thm-btn thm-btn-white product-btn"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleProductSelect(product);
                                            }}
                                        >
                                            Elegir
                                        </a>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="waas-product text-center">
                            <p className="mb-0">No hay productos disponibles para esta selección.</p>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );

    const renderSelectionDetail = () => (
        <div className="row">
            <div className="quest-title col-12">
                <h3>Selecciona el precio</h3>
            </div>
            <div className="product-selected col-md-5 mb-4 mb-md-0">
                {selectedProduct ? (
                    <img
                        src={normalizeImageUrl(selectedProduct.main_image) || FALLBACK_IMAGE}
                        alt={selectedProduct.model || selectedProduct.name}
                        onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        title={selectedProduct.model || selectedProduct.name}
                    />
                ) : (
                    <p className="text-white-50">Elige un producto para ver los precios.</p>
                )}
            </div>
            <div className="offset-md-1 col-md-6">
                <div className="tab-content b-0 mb-0">
                    <div className={`appear2 ${step === 'dues' ? '' : 'hidden'}`} id="product_due">
                        {priceList.length ? (
                            <ul className="list-dues">
                                {priceList.map((price) => (
                                    <li key={price.id} className="d-flex justify-content-between align-items-center">
                                        <span className="product-company-price">
                                            {formatCurrency(price.price)}
                                        </span>
                                        <ConfButton
                                            label={Number(price.duties) === 1 ? 'Pago único' : `${price.duties} cuotas`}
                                            variant={Number(selectedDue) === Number(price.duties) ? 'default' : 'light'}
                                            onClick={() => handleDueSelect(Number(price.duties))}
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-white-50 mb-0">Este producto no tiene precios configurados.</p>
                        )}
                    </div>
                    <div className={`conf-panel ${step === 'extras' ? '' : 'hidden'}`} id="product_extras">
                        <div className="quest-title mb-4">
                            <h3>Selecciona los Extras</h3>
                            <p className="text-white-50">Elige los extras que deseas añadir a tu producto</p>
                        </div>
                        {extrasList.length ? (
                            <div className="extras-list">
                                {extrasList.map((extra, index) => {
                                    const isSelected = selectedExtras.includes(String(index));
                                    return (
                                        <div 
                                            className={`extra mb-3 p-3 rounded border ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`} 
                                            key={index} 
                                            data-pk={index}
                                            style={{ 
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => toggleExtra(index)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <h5 className={`mb-2 fw-bold ${isSelected ? 'text-white' : 'text-dark'}`}>
                                                        {extra.name || extra.label || `Extra ${index + 1}`}
                                                    </h5>
                                                    {(extra.description || extra.desc) && (
                                                        <p className={`mb-2 ${isSelected ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                            {extra.description || extra.desc}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ms-3 text-end">
                                                    <div className={`fw-bold fs-5 ${isSelected ? 'text-white' : 'text-dark'}`}>
                                                        {formatCurrency(extra.price || 0)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="quest-answers answers-inline mt-2">
                                                <ConfButton
                                                    label={isSelected ? '✓ Extra seleccionado' : 'Seleccionar extra'}
                                                    variant={isSelected ? 'default' : 'light'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExtra(index);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-white-50 mb-0">No hay extras disponibles para este producto.</p>
                            </div>
                        )}
                        {selectedExtras.length > 0 && (
                            <div className="mt-4 p-3 bg-primary bg-opacity-20 rounded border border-primary">
                                <p className="mb-2 text-white fw-semibold">
                                    Extras seleccionados: {selectedExtras.length}
                                </p>
                                <p className="mb-0 text-white-50 small">
                                    Total extras: {formatCurrency(
                                        selectedExtrasDetails.reduce((sum, extra) => sum + Number(extra.price ?? 0), 0)
                                    )}
                                </p>
                            </div>
                        )}
                        <div className="text-end mt-4">
                            <ConfButton label="Continuar" onClick={proceedToResult} disabled={submitting} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSelectionPhase = () => {
        if (step === 'products') {
            return renderProductsGrid();
        }

        if (!selectedProduct) {
            return (
                <div className="text-center py-5">
                    <p className="mb-0">Selecciona un producto para continuar.</p>
                    <ConfButton className="mt-3" label="Volver a productos" onClick={() => goToStep('products')} />
                </div>
            );
        }

        return renderSelectionDetail();
    };

    const renderResultPhase = () => {
        if (!result || !selectedProduct) {
            return (
                <div className="text-center py-5">
                    <p className="mb-0 text-muted">Completa el cuestionario para ver tus resultados.</p>
                </div>
            );
        }

        const dueLabel = Number(result.due) === 1 ? 'Pago único' : `${result.due} cuotas`;

        return (
            <div className="row" data-product={selectedProduct.id}>
                <div className="col-12 mb-5 d-flex justify-content-between flex-wrap-reverse flex-row-reverse result-header">
                    <a
                        id="download_pdf_saving"
                        className="icon-btn download-print"
                        href="#"
                        title="Descargar impresión del ahorro"
                        onClick={(e) => {
                            e.preventDefault();
                            if (typeof window !== 'undefined') {
                                window.print();
                            }
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 40 40">
                            <path d="M9.458 33.333q-1.125 0-1.958-.833t-.833-1.958v-5.625h2.791v5.625h21.084v-5.625h2.791v5.625q0 1.125-.833 1.958t-1.958.833ZM20 26.875l-8.125-8.167 1.958-2 4.792 4.792V6.667h2.75V21.5l4.792-4.792 1.958 2Z" />
                        </svg>
                        <span>Descargar impresión del ahorro</span>
                    </a>
                    <h3 className="mb-0 result-title">Tomar Agua de Calidad:<br />Un Acto de Amor Propio</h3>
                </div>

                <div className="col-lg-3 col-12 mb-4">
                    <div className="row">
                        <div className="saving col-md-4 col-lg-12" id="result_bottles">
                            <img src={ICONS.bottles} alt="Botellas" />
                            <h3 className="counter">{result.bottles}</h3>
                            <p>Botellas ahorradas al planeta al mes</p>
                        </div>
                        <div className="saving col-md-4 col-lg-12" id="result_plastic">
                            <img src={ICONS.kg} alt="Kg plástico" />
                            <h3 className="counter">{result.kg}</h3>
                            <p>Kg de plástico ahorrados al planeta al mes</p>
                        </div>
                        <div className="saving col-md-4 col-lg-12" id="result_co2">
                            <img src={ICONS.co2} alt="CO₂" />
                            <h3 className="counter">{result.co2}</h3>
                            <p>Kg de CO₂ ahorrados al planeta al mes</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 col-12 pt-2 pt-md-1">
                    <div className="product-result">
                        <div className="product-result-image">
                            <img
                                src={normalizeImageUrl(selectedProduct.main_image) || FALLBACK_IMAGE}
                                alt={selectedProduct.model || selectedProduct.name}
                                onError={(e) => {
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                            />
                        </div>
                        <div className="product-result-desc">
                            <h2>{selectedProduct.name || selectedProduct.model}</h2>
                            {selectedExtrasDetails.map((extra, index) => {
                                const extraName = extra.name || extra.label || `Extra ${index + 1}`;
                                const extraPrice = extra.price ? formatCurrency(extra.price) : '';
                                return (
                                    <h4 key={extra.id || extra.label || index}>
                                        + {extraName}{extraPrice ? ` (${extraPrice})` : ''}
                                    </h4>
                                );
                            })}
                            <h5>
                                <span className="font-weight-bold">{dueLabel}</span>
                            </h5>
                            <h3>
                                <span className="font-weight-bold">{result.aqua_price}</span>
                            </h3>
                            <h5>
                                <span className="small">(IVA no incluido)</span>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-12 mb-4">
                    <div className="row">
                        <div className="saving col-md-4 col-lg-12" id="result_money">
                            <img src={ICONS.coins} alt="Gasto actual" />
                            <h3 className="counter">{result.price}</h3>
                            <p>Gasto mensual aproximado actual</p>
                        </div>
                        <div className="saving col-md-4 col-lg-12" id="result_money_aqua">
                            <img src={ICONS.money} alt="Gasto Aquaam" />
                            <h3 className="counter">{result.aqua_price}</h3>
                            <p>Gasto mensual Aquaam</p>
                        </div>
                        <div className="saving col-md-4 col-lg-12" id="result_money_saving">
                            <img src={ICONS.saving} alt="Ahorro" />
                            <h3 className="counter">{result.saving_price}</h3>
                            <p>Ahorro estimado en 5 años</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 mt-4 result-copy">
                    <p><b>Beber agua no es solo una necesidad básica, es una forma poderosa de cuidar tu salud desde adentro. Pero no se trata de cualquier agua: la calidad importa. Aquí te explico por qué:</b></p>
                    <h3>AQUAAM te garantiza agua de calidad y efectiva.</h3>
                    <h5>1.Filtros con alta capacidad de filtración que garantizan tu salud.</h5>
                    <p>El agua limpia y libre de contaminantes permite que tu cuerpo absorba mejor los minerales y mantenga el equilibrio de líquidos. Esto se traduce en más energía, mejor concentración y menos fatiga.</p>
                    <h5>2. Protección contra enfermedades</h5>
                    <p>El agua DEL GRIFO contiene bacterias, metales pesados y químicos que afectan tu salud a largo plazo. Beber agua purificada reduce el riesgo de infecciones, problemas digestivos y enfermedades renales. Como SIBO</p>
                    <h5>3. Apoyo a tus órganos vitales</h5>
                    <p>Tus riñones, hígado y sistema digestivo dependen del agua para funcionar correctamente. Si el agua es de mala calidad, estos órganos trabajan más y se desgastan antes.</p>
                    <h5>4. Mejora tu piel y tu bienestar general</h5>
                    <p>Una buena hidratación con agua pura ayuda a eliminar toxinas, lo que se refleja en una piel más limpia, luminosa y saludable. También mejora el estado de ánimo y reduce el estrés.</p>
                    <h5>5. Claridad mental y equilibrio emocional</h5>
                    <p>La deshidratación, incluso leve, puede afectar tu memoria, concentración y estado de ánimo. El agua de calidad mantiene tu mente clara y tu cuerpo en armonía.</p>
                </div>

                <div className="col-12 quest-answers answers-inline justify-content-between align-items-end mt-4 saving-actions">
                    <div className="quest-answer mt-4 mt-md-0">
                        <h5 className="mb-3">¿Tienes alguna pregunta?</h5>
                        <a
                            href="https://aquaam.es/#contacto"
                            id="saving_result_contact"
                            className="conf-btn conf-btn-icon text-center me-0"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>Contáctanos</span>
                        </a>
                    </div>
                    <div className="quest-answer d-flex flex-column align-bottom">
                        <ConfButton
                            label="¡Lo quiero!"
                            onClick={() => toast.success('Un asesor se pondrá en contacto contigo.')}
                        />
                    </div>
                </div>

                <div className="col-12 justify-content-center d-flex flex-column mt-5 mb-2 mb-md-5 pb-2 pb-md-5 calc-saving-conditions">
                    <div dangerouslySetInnerHTML={{ __html: CONDITIONS_HTML }} />
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Calcula tu ahorro" />
            <div className="calc-saving-wrapper">
                {(initialLoading || submitting) && (
                    <div className="calc-saving-preloader">
                        <div className="preloader-content">
                            <lottie-player
                                src="https://assets9.lottiefiles.com/packages/lf20_t5uo7upc.json"
                                background="transparent"
                                speed="1.2"
                                style={{ width: 220, height: 220 }}
                                loop
                                autoplay
                            ></lottie-player>
                            <p>Calculando ahorro...</p>
                        </div>
                    </div>
                )}
                <section className="section configurator section-with-shape-divider overflow-inicial bg-forest" id="configurator">
                    <div className="bg-overlay"></div>
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <div id="bar" className="calc-progress">
                                    <div className="calc-progress__track">
                                        <div
                                            className="calc-progress__fill"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="calc-progress__points">
                                        {PROGRESS_PHASES.map((label, idx) => (
                                            <div
                                                key={label}
                                                className={`progress-point ${idx < phase ? 'completed' : ''} ${idx === phase ? 'current' : ''}`}
                                            >
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`tab-content ${phase === 0 ? '' : 'hidden'}`} id="step-questions">
                                    {renderQuestionContent()}
                                </div>

                                <div className={`col-12 ${phase === 1 ? '' : 'hidden'}`} id="select-prod">
                                    {renderSelectionPhase()}
                                </div>

                                <div className="col-12">
                                    <div className={`tab-content ${phase === 2 ? '' : 'hidden'}`} id="saving_result">
                                        {renderResultPhase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
};

export default CalcSaving;
