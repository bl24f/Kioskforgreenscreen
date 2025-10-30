import { useReducer, useCallback, useState, useEffect } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { DeliveryPaymentScreen } from "./components/DeliveryPaymentScreen";
import { BackgroundSelectionScreen } from "./components/BackgroundSelectionScreen";
import { QuickPhotoScreen } from "./components/QuickPhotoScreen";
import { UserInfoScreen } from "./components/UserInfoScreen";
import { ConfirmationScreen } from "./components/ConfirmationScreen";
import { FinalReceiptScreen } from "./components/FinalReceiptScreen";
import { AFKWarningDialog } from "./components/AFKWarningDialog";
import { ProgressBar } from "./components/ProgressBar";
import { HelpButton } from "./components/HelpButton";
import { SelectBackgroundOutputsDialog, BackgroundOutput } from "./components/SelectBackgroundOutputsDialog";
import { getNextOrderNumber } from "./components/OrderNumberManager";

type Step =
  | "home"
  | "delivery"
  | "background"
  | "quickPhoto"
  | "userInfo"
  | "confirmation"
  | "receipt";

const STEP_LABELS = [
  "Delivery",
  "Background",
  "Your Info",
  "Confirm",
  "Quick Selfie",
];

const getStepNumber = (step: Step): number | null => {
  switch (step) {
    case "delivery":
      return 1;
    case "background":
      return 2;
    case "userInfo":
      return 3;
    case "confirmation":
      return 4;
    case "quickPhoto":
      return 5;
    default:
      return null;
  }
};

interface AppState {
  currentStep: Step;
  visitedSteps: Set<number>;
  basePrice: string;
  theme: string;
  deliveryMethod: string[];
  numberOfPhotos: string;
  numberOfEmailPhotos: string;
  paymentType: string;
  selectedBackgrounds: (number | string)[];
  backgroundOutputs: BackgroundOutput;
  capturedPhotos: string[];
  userName: string;
  emails: string[];
  numberOfPeople: string;
  customerNumber: string;
  orderNumber: string;
  // Admin settings
  availablePaymentMethods: string[];
  availableDeliveryMethods: string[];
  maxNumberOfPhotos: number;
  maxNumberOfEmails: number;
  maxNumberOfPrints: number;
  maxDigitalBackgrounds: number;
  enabledBackgrounds: number[];
  enableCustomBackgrounds: boolean;
  isFreeDay: boolean;
  showFreeDayOption: boolean;
}

type AppAction =
  | { type: "SET_STEP"; payload: Step }
  | { type: "SET_BASE_PRICE"; payload: string }
  | { type: "SET_THEME"; payload: string }
  | { type: "SET_DELIVERY_METHOD"; payload: string[] }
  | { type: "SET_NUMBER_OF_PHOTOS"; payload: string }
  | { type: "SET_NUMBER_OF_EMAIL_PHOTOS"; payload: string }
  | { type: "SET_PAYMENT_TYPE"; payload: string }
  | { type: "SET_SELECTED_BACKGROUNDS"; payload: (number | string)[] }
  | { type: "SET_BACKGROUND_OUTPUTS"; payload: BackgroundOutput }
  | { type: "SET_CAPTURED_PHOTOS"; payload: string[] }
  | { type: "SET_USER_NAME"; payload: string }
  | { type: "SET_EMAILS"; payload: string[] }
  | { type: "SET_NUMBER_OF_PEOPLE"; payload: string }
  | { type: "SET_CUSTOMER_NUMBER"; payload: string }
  | { type: "SET_ORDER_NUMBER"; payload: string }
  | { type: "SET_AVAILABLE_PAYMENT_METHODS"; payload: string[] }
  | { type: "SET_AVAILABLE_DELIVERY_METHODS"; payload: string[] }
  | { type: "SET_MAX_NUMBER_OF_PHOTOS"; payload: number }
  | { type: "SET_MAX_NUMBER_OF_EMAILS"; payload: number }
  | { type: "SET_MAX_NUMBER_OF_PRINTS"; payload: number }
  | { type: "SET_MAX_DIGITAL_BACKGROUNDS"; payload: number }
  | { type: "SET_ENABLED_BACKGROUNDS"; payload: number[] }
  | { type: "SET_ENABLE_CUSTOM_BACKGROUNDS"; payload: boolean }
  | { type: "SET_IS_FREE_DAY"; payload: boolean }
  | { type: "SET_SHOW_FREE_DAY_OPTION"; payload: boolean }
  | { type: "RESET_ALL" }
  | { type: "RESET_SESSION" };

const initialState: AppState = {
  currentStep: "home",
  visitedSteps: new Set<number>(),
  basePrice: "10.00",
  theme: "",
  deliveryMethod: ["email"],
  numberOfPhotos: "1",
  numberOfEmailPhotos: "1",
  paymentType: "cash",
  selectedBackgrounds: [],
  backgroundOutputs: {},
  capturedPhotos: [],
  userName: "",
  emails: ["", "", "", "", ""], // Initialize with 5 empty emails
  numberOfPeople: "1",
  customerNumber: "",
  orderNumber: "",
  // Admin settings defaults
  availablePaymentMethods: ["cash", "debit", "credit", "check"],
  availableDeliveryMethods: ["email", "prints"],
  maxNumberOfPhotos: 10,
  maxNumberOfEmails: 5,
  maxNumberOfPrints: 20,
  maxDigitalBackgrounds: 3,
  enabledBackgrounds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  enableCustomBackgrounds: false,
  isFreeDay: false,
  showFreeDayOption: false,
};

function appReducer(
  state: AppState,
  action: AppAction,
): AppState {
  switch (action.type) {
    case "SET_STEP": {
      const stepNumber = getStepNumber(action.payload);
      const newVisitedSteps = new Set(state.visitedSteps);
      if (stepNumber !== null) {
        newVisitedSteps.add(stepNumber);
      }
      
      // Generate customer number and order number when moving to delivery step (start of order)
      let newCustomerNumber = state.customerNumber;
      let newOrderNumber = state.orderNumber;
      if (action.payload === "delivery" && !state.customerNumber) {
        newCustomerNumber = `CN-${Date.now().toString().slice(-8)}`;
        newOrderNumber = getNextOrderNumber();
      }
      
      return { 
        ...state, 
        currentStep: action.payload,
        visitedSteps: newVisitedSteps,
        customerNumber: newCustomerNumber,
        orderNumber: newOrderNumber,
      };
    }
    case "SET_BASE_PRICE":
      return { ...state, basePrice: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_DELIVERY_METHOD":
      return { ...state, deliveryMethod: action.payload };
    case "SET_NUMBER_OF_PHOTOS":
      return { ...state, numberOfPhotos: action.payload };
    case "SET_NUMBER_OF_EMAIL_PHOTOS":
      return { ...state, numberOfEmailPhotos: action.payload };
    case "SET_PAYMENT_TYPE":
      return { ...state, paymentType: action.payload };
    case "SET_SELECTED_BACKGROUNDS":
      return { ...state, selectedBackgrounds: action.payload };
    case "SET_BACKGROUND_OUTPUTS":
      return { ...state, backgroundOutputs: action.payload };
    case "SET_CAPTURED_PHOTOS":
      return { ...state, capturedPhotos: action.payload };
    case "SET_USER_NAME":
      return { ...state, userName: action.payload };
    case "SET_EMAILS":
      return { ...state, emails: action.payload };
    case "SET_NUMBER_OF_PEOPLE":
      return { ...state, numberOfPeople: action.payload };
    case "SET_CUSTOMER_NUMBER":
      return { ...state, customerNumber: action.payload };
    case "SET_ORDER_NUMBER":
      return { ...state, orderNumber: action.payload };
    case "SET_AVAILABLE_PAYMENT_METHODS":
      return { ...state, availablePaymentMethods: action.payload };
    case "SET_AVAILABLE_DELIVERY_METHODS":
      return { ...state, availableDeliveryMethods: action.payload };
    case "SET_MAX_NUMBER_OF_PHOTOS":
      return { ...state, maxNumberOfPhotos: action.payload };
    case "SET_MAX_NUMBER_OF_EMAILS":
      return { ...state, maxNumberOfEmails: action.payload };
    case "SET_MAX_NUMBER_OF_PRINTS":
      return { ...state, maxNumberOfPrints: action.payload };
    case "SET_MAX_DIGITAL_BACKGROUNDS":
      return { ...state, maxDigitalBackgrounds: action.payload };
    case "SET_ENABLED_BACKGROUNDS":
      return { ...state, enabledBackgrounds: action.payload };
    case "SET_ENABLE_CUSTOM_BACKGROUNDS":
      return { ...state, enableCustomBackgrounds: action.payload };
    case "SET_IS_FREE_DAY":
      return { ...state, isFreeDay: action.payload };
    case "SET_SHOW_FREE_DAY_OPTION":
      return { ...state, showFreeDayOption: action.payload };
    case "RESET_ALL":
      return initialState;
    case "RESET_SESSION":
      return {
        ...state,
        currentStep: "home",
        visitedSteps: new Set(),
        deliveryMethod: ["email"],
        numberOfPhotos: "1",
        numberOfEmailPhotos: "1",
        paymentType: "cash",
        selectedBackgrounds: [],
        backgroundOutputs: {},
        capturedPhotos: [],
        userName: "",
        emails: ["", "", "", "", ""],
        numberOfPeople: "1",
        customerNumber: "",
        orderNumber: "",
      };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(
    appReducer,
    initialState,
  );

  // State for background outputs dialog
  const [showOutputsDialog, setShowOutputsDialog] = useState(false);
  
  // State for background names mapping
  const [backgroundNames, setBackgroundNames] = useState<{ [key: string]: string }>({});
  
  // State for background images mapping
  const [backgroundImages, setBackgroundImages] = useState<{ [key: string]: string }>({});

  // Memoize the callback to prevent infinite re-renders
  const handleBackgroundNamesChange = useCallback((names: { [key: string]: string }) => {
    setBackgroundNames(names);
  }, []);
  
  const handleBackgroundImagesChange = useCallback((images: { [key: string]: string }) => {
    setBackgroundImages(images);
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: "RESET_SESSION"});
  }, []);

  // Initialize background outputs when backgrounds are selected
  useEffect(() => {
    const bothDeliveryMethods = 
      state.deliveryMethod.includes("email") && 
      state.deliveryMethod.includes("prints");
    
    // Initialize outputs for newly selected backgrounds
    const newOutputs = { ...state.backgroundOutputs };
    let needsUpdate = false;

    state.selectedBackgrounds.forEach((bgId) => {
      const key = String(bgId);
      if (!newOutputs[key]) {
        // Initialize with both methods if both are selected, otherwise default behavior
        if (bothDeliveryMethods) {
          newOutputs[key] = { print: 0, email: true };
        } else {
          newOutputs[key] = {
            print: 0,
            email: state.deliveryMethod.includes("email"),
          };
        }
        needsUpdate = true;
      }
    });

    // Clean up outputs for backgrounds that are no longer selected
    Object.keys(newOutputs).forEach((key) => {
      if (!state.selectedBackgrounds.some((bg) => String(bg) === key)) {
        delete newOutputs[key];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      dispatch({ type: "SET_BACKGROUND_OUTPUTS", payload: newOutputs });
    }
  }, [state.selectedBackgrounds, state.deliveryMethod, state.backgroundOutputs]);

  const handleStepClick = useCallback((stepNumber: number) => {
    // Only allow clicking on visited steps
    if (!state.visitedSteps.has(stepNumber)) {
      return;
    }
    
    let targetStep: Step;
    switch (stepNumber) {
      case 1:
        targetStep = "delivery";
        break;
      case 2:
        targetStep = "background";
        break;
      case 3:
        targetStep = "userInfo";
        break;
      case 4:
        targetStep = "confirmation";
        break;
      case 5:
        targetStep = "quickPhoto";
        break;
      default:
        return;
    }
    dispatch({ type: "SET_STEP", payload: targetStep });
  }, [state.visitedSteps]);

  const stepNumber = getStepNumber(state.currentStep);
  const showProgress = stepNumber !== null;

  return (
    <div className="relative min-h-screen">
      {showProgress && (
        <ProgressBar
          currentStep={stepNumber}
          totalSteps={5}
          stepLabels={STEP_LABELS}
          visitedSteps={state.visitedSteps}
          onStepClick={handleStepClick}
        />
      )}
      <div className={showProgress ? "pt-28 sm:pt-32" : ""}>
        {state.currentStep === "home" && (
          <HomeScreen
            basePrice={state.basePrice}
            setBasePrice={(value) =>
              dispatch({
                type: "SET_BASE_PRICE",
                payload: value,
              })
            }
            theme={state.theme}
            setTheme={(value) =>
              dispatch({ type: "SET_THEME", payload: value })
            }
            availablePaymentMethods={state.availablePaymentMethods}
            setAvailablePaymentMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_PAYMENT_METHODS", payload: value })
            }
            availableDeliveryMethods={state.availableDeliveryMethods}
            setAvailableDeliveryMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_DELIVERY_METHODS", payload: value })
            }
            maxNumberOfPhotos={state.maxNumberOfPhotos}
            setMaxNumberOfPhotos={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PHOTOS", payload: value })
            }
            maxNumberOfEmails={state.maxNumberOfEmails}
            setMaxNumberOfEmails={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_EMAILS", payload: value })
            }
            maxNumberOfPrints={state.maxNumberOfPrints}
            setMaxNumberOfPrints={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PRINTS", payload: value })
            }
            maxDigitalBackgrounds={state.maxDigitalBackgrounds}
            setMaxDigitalBackgrounds={(value) =>
              dispatch({ type: "SET_MAX_DIGITAL_BACKGROUNDS", payload: value })
            }
            enabledBackgrounds={state.enabledBackgrounds}
            setEnabledBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLED_BACKGROUNDS", payload: value })
            }
            enableCustomBackgrounds={state.enableCustomBackgrounds}
            setEnableCustomBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLE_CUSTOM_BACKGROUNDS", payload: value })
            }
            isFreeDay={state.isFreeDay}
            setIsFreeDay={(value) =>
              dispatch({ type: "SET_IS_FREE_DAY", payload: value })
            }
            showFreeDayOption={state.showFreeDayOption}
            setShowFreeDayOption={(value) =>
              dispatch({ type: "SET_SHOW_FREE_DAY_OPTION", payload: value })
            }
            onStart={() =>
              dispatch({
                type: "SET_STEP",
                payload: "delivery",
              })
            }
          />
        )}

        {state.currentStep === "delivery" && (
          <DeliveryPaymentScreen
            deliveryMethod={state.deliveryMethod}
            setDeliveryMethod={(value) =>
              dispatch({
                type: "SET_DELIVERY_METHOD",
                payload: value,
              })
            }
            numberOfPhotos={state.numberOfPhotos}
            setNumberOfPhotos={(value) =>
              dispatch({
                type: "SET_NUMBER_OF_PHOTOS",
                payload: value,
              })
            }
            numberOfEmailPhotos={state.numberOfEmailPhotos}
            setNumberOfEmailPhotos={(value) =>
              dispatch({
                type: "SET_NUMBER_OF_EMAIL_PHOTOS",
                payload: value,
              })
            }
            paymentType={state.paymentType}
            setPaymentType={(value) =>
              dispatch({
                type: "SET_PAYMENT_TYPE",
                payload: value,
              })
            }
            basePrice={state.basePrice}
            selectedBackgrounds={state.selectedBackgrounds}
            availablePaymentMethods={state.availablePaymentMethods}
            availableDeliveryMethods={state.availableDeliveryMethods}
            maxNumberOfPhotos={state.maxNumberOfPhotos}
            maxNumberOfEmails={state.maxNumberOfEmails}
            maxNumberOfPrints={state.maxNumberOfPrints}
            isFreeDay={state.isFreeDay}
            showFreeDayOption={state.showFreeDayOption}
            onNext={() =>
              dispatch({
                type: "SET_STEP",
                payload: "background",
              })
            }
            onBack={() =>
              dispatch({ type: "SET_STEP", payload: "home" })
            }
            onCancel={resetSession}
            setBasePrice={(value) =>
              dispatch({
                type: "SET_BASE_PRICE",
                payload: value,
              })
            }
            theme={state.theme}
            setTheme={(value) =>
              dispatch({ type: "SET_THEME", payload: value })
            }
            setAvailablePaymentMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_PAYMENT_METHODS", payload: value })
            }
            setAvailableDeliveryMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_DELIVERY_METHODS", payload: value })
            }
            setMaxNumberOfPhotos={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PHOTOS", payload: value })
            }
            setMaxNumberOfEmails={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_EMAILS", payload: value })
            }
            setMaxNumberOfPrints={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PRINTS", payload: value })
            }
            enabledBackgrounds={state.enabledBackgrounds}
            setEnabledBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLED_BACKGROUNDS", payload: value })
            }
            enableCustomBackgrounds={state.enableCustomBackgrounds}
            setEnableCustomBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLE_CUSTOM_BACKGROUNDS", payload: value })
            }
            setIsFreeDay={(value) =>
              dispatch({ type: "SET_IS_FREE_DAY", payload: value })
            }
            setShowFreeDayOption={(value) =>
              dispatch({ type: "SET_SHOW_FREE_DAY_OPTION", payload: value })
            }
          />
        )}

        {state.currentStep === "background" && (
          <BackgroundSelectionScreen
            selectedBackgrounds={state.selectedBackgrounds}
            setSelectedBackgrounds={(value) =>
              dispatch({
                type: "SET_SELECTED_BACKGROUNDS",
                payload: value,
              })
            }
            enabledBackgrounds={state.enabledBackgrounds}
            enableCustomBackgrounds={state.enableCustomBackgrounds}
            numberOfPhotos={(() => {
              if (state.deliveryMethod.includes("prints")) {
                return parseInt(state.numberOfPhotos) || 1;
              } else {
                // Only email selected, use maxDigitalBackgrounds setting
                return state.maxDigitalBackgrounds;
              }
            })()}
            deliveryMethod={state.deliveryMethod}
            onBackgroundNamesChange={handleBackgroundNamesChange}
            onBackgroundImagesChange={handleBackgroundImagesChange}
            onNext={() => {
              // If both delivery methods are selected, show the outputs dialog
              const bothMethods = 
                state.deliveryMethod.includes("email") && 
                state.deliveryMethod.includes("prints");
              
              if (bothMethods && state.selectedBackgrounds.length > 0) {
                setShowOutputsDialog(true);
              } else {
                dispatch({
                  type: "SET_STEP",
                  payload: "userInfo",
                });
              }
            }}
            onBack={() =>
              dispatch({
                type: "SET_STEP",
                payload: "delivery",
              })
            }
            onCancel={resetSession}
            basePrice={state.basePrice}
            setBasePrice={(value) =>
              dispatch({
                type: "SET_BASE_PRICE",
                payload: value,
              })
            }
            theme={state.theme}
            setTheme={(value) =>
              dispatch({ type: "SET_THEME", payload: value })
            }
            availablePaymentMethods={state.availablePaymentMethods}
            setAvailablePaymentMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_PAYMENT_METHODS", payload: value })
            }
            availableDeliveryMethods={state.availableDeliveryMethods}
            setAvailableDeliveryMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_DELIVERY_METHODS", payload: value })
            }
            maxNumberOfPhotos={state.maxNumberOfPhotos}
            setMaxNumberOfPhotos={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PHOTOS", payload: value })
            }
            maxNumberOfEmails={state.maxNumberOfEmails}
            setMaxNumberOfEmails={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_EMAILS", payload: value })
            }
            maxNumberOfPrints={state.maxNumberOfPrints}
            setMaxNumberOfPrints={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PRINTS", payload: value })
            }
            maxDigitalBackgrounds={state.maxDigitalBackgrounds}
            setMaxDigitalBackgrounds={(value) =>
              dispatch({ type: "SET_MAX_DIGITAL_BACKGROUNDS", payload: value })
            }
            setEnabledBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLED_BACKGROUNDS", payload: value })
            }
            setEnableCustomBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLE_CUSTOM_BACKGROUNDS", payload: value })
            }
            isFreeDay={state.isFreeDay}
            setIsFreeDay={(value) =>
              dispatch({ type: "SET_IS_FREE_DAY", payload: value })
            }
            showFreeDayOption={state.showFreeDayOption}
            setShowFreeDayOption={(value) =>
              dispatch({ type: "SET_SHOW_FREE_DAY_OPTION", payload: value })
            }
          />
        )}

        {state.currentStep === "userInfo" && (
          <UserInfoScreen
            userName={state.userName}
            setUserName={(value) =>
              dispatch({
                type: "SET_USER_NAME",
                payload: value,
              })
            }
            emails={state.emails}
            setEmails={(value) =>
              dispatch({ type: "SET_EMAILS", payload: value })
            }
            maxNumberOfEmails={state.maxNumberOfEmails}
            numberOfPeople={state.numberOfPeople}
            setNumberOfPeople={(value) =>
              dispatch({
                type: "SET_NUMBER_OF_PEOPLE",
                payload: value,
              })
            }
            deliveryMethod={state.deliveryMethod}
            numberOfPhotos={state.numberOfPhotos}
            selectedBackgrounds={state.selectedBackgrounds}
            onNext={() =>
              dispatch({
                type: "SET_STEP",
                payload: "confirmation",
              })
            }
            onBack={() =>
              dispatch({
                type: "SET_STEP",
                payload: "background",
              })
            }
            onCancel={resetSession}
            basePrice={state.basePrice}
            setBasePrice={(value) =>
              dispatch({
                type: "SET_BASE_PRICE",
                payload: value,
              })
            }
            theme={state.theme}
            setTheme={(value) =>
              dispatch({ type: "SET_THEME", payload: value })
            }
            availablePaymentMethods={state.availablePaymentMethods}
            setAvailablePaymentMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_PAYMENT_METHODS", payload: value })
            }
            availableDeliveryMethods={state.availableDeliveryMethods}
            setAvailableDeliveryMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_DELIVERY_METHODS", payload: value })
            }
            maxNumberOfPhotos={state.maxNumberOfPhotos}
            setMaxNumberOfPhotos={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PHOTOS", payload: value })
            }
            setMaxNumberOfEmails={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_EMAILS", payload: value })
            }
            maxNumberOfPrints={state.maxNumberOfPrints}
            setMaxNumberOfPrints={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PRINTS", payload: value })
            }
            enabledBackgrounds={state.enabledBackgrounds}
            setEnabledBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLED_BACKGROUNDS", payload: value })
            }
            enableCustomBackgrounds={state.enableCustomBackgrounds}
            setEnableCustomBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLE_CUSTOM_BACKGROUNDS", payload: value })
            }
            isFreeDay={state.isFreeDay}
            setIsFreeDay={(value) =>
              dispatch({ type: "SET_IS_FREE_DAY", payload: value })
            }
            showFreeDayOption={state.showFreeDayOption}
            setShowFreeDayOption={(value) =>
              dispatch({ type: "SET_SHOW_FREE_DAY_OPTION", payload: value })
            }
          />
        )}

        {state.currentStep === "confirmation" && (
          <ConfirmationScreen
            userName={state.userName}
            emails={state.emails}
            numberOfPeople={state.numberOfPeople}
            selectedBackgrounds={state.selectedBackgrounds}
            deliveryMethod={state.deliveryMethod}
            numberOfPhotos={state.numberOfPhotos}
            paymentType={state.paymentType}
            basePrice={state.basePrice}
            theme={state.theme}
            isFreeDay={state.isFreeDay}
            onConfirm={() =>
              dispatch({ type: "SET_STEP", payload: "quickPhoto" })
            }
            onQuit={resetAll}
            onBack={() =>
              dispatch({
                type: "SET_STEP",
                payload: "userInfo",
              })
            }
            onEditPersonalInfo={() =>
              dispatch({
                type: "SET_STEP",
                payload: "userInfo",
              })
            }
            onEditDelivery={() =>
              dispatch({
                type: "SET_STEP",
                payload: "delivery",
              })
            }
            onEditBackground={() =>
              dispatch({
                type: "SET_STEP",
                payload: "background",
              })
            }
            onEditQuickPhoto={() =>
              dispatch({
                type: "SET_STEP",
                payload: "quickPhoto",
              })
            }
            onEditBackgroundOutputs={
              state.deliveryMethod.includes("email") && 
              state.deliveryMethod.includes("prints")
                ? () => setShowOutputsDialog(true)
                : undefined
            }
            setBasePrice={(value) =>
              dispatch({
                type: "SET_BASE_PRICE",
                payload: value,
              })
            }
            setTheme={(value) =>
              dispatch({ type: "SET_THEME", payload: value })
            }
            availablePaymentMethods={state.availablePaymentMethods}
            setAvailablePaymentMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_PAYMENT_METHODS", payload: value })
            }
            availableDeliveryMethods={state.availableDeliveryMethods}
            setAvailableDeliveryMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_DELIVERY_METHODS", payload: value })
            }
            maxNumberOfPhotos={state.maxNumberOfPhotos}
            setMaxNumberOfPhotos={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PHOTOS", payload: value })
            }
            maxNumberOfEmails={state.maxNumberOfEmails}
            setMaxNumberOfEmails={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_EMAILS", payload: value })
            }
            maxNumberOfPrints={state.maxNumberOfPrints}
            setMaxNumberOfPrints={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PRINTS", payload: value })
            }
            enabledBackgrounds={state.enabledBackgrounds}
            setEnabledBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLED_BACKGROUNDS", payload: value })
            }
            enableCustomBackgrounds={state.enableCustomBackgrounds}
            setEnableCustomBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLE_CUSTOM_BACKGROUNDS", payload: value })
            }
            setIsFreeDay={(value) =>
              dispatch({ type: "SET_IS_FREE_DAY", payload: value })
            }
            showFreeDayOption={state.showFreeDayOption}
            setShowFreeDayOption={(value) =>
              dispatch({ type: "SET_SHOW_FREE_DAY_OPTION", payload: value })
            }
          />
        )}

        {state.currentStep === "quickPhoto" && (
          <QuickPhotoScreen
            numberOfPeople={state.numberOfPeople}
            selectedBackgrounds={state.selectedBackgrounds}
            capturedPhotos={state.capturedPhotos}
            setCapturedPhotos={(value) =>
              dispatch({
                type: "SET_CAPTURED_PHOTOS",
                payload: value,
              })
            }
            customerNumber={state.customerNumber}
            orderNumber={state.orderNumber}
            onNext={() =>
              dispatch({
                type: "SET_STEP",
                payload: "receipt",
              })
            }
            onBack={() =>
              dispatch({
                type: "SET_STEP",
                payload: "confirmation",
              })
            }
            onCancel={resetSession}
            basePrice={state.basePrice}
            setBasePrice={(value) =>
              dispatch({
                type: "SET_BASE_PRICE",
                payload: value,
              })
            }
            theme={state.theme}
            setTheme={(value) =>
              dispatch({ type: "SET_THEME", payload: value })
            }
            availablePaymentMethods={state.availablePaymentMethods}
            setAvailablePaymentMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_PAYMENT_METHODS", payload: value })
            }
            availableDeliveryMethods={state.availableDeliveryMethods}
            setAvailableDeliveryMethods={(value) =>
              dispatch({ type: "SET_AVAILABLE_DELIVERY_METHODS", payload: value })
            }
            maxNumberOfPhotos={state.maxNumberOfPhotos}
            setMaxNumberOfPhotos={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PHOTOS", payload: value })
            }
            maxNumberOfEmails={state.maxNumberOfEmails}
            setMaxNumberOfEmails={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_EMAILS", payload: value })
            }
            maxNumberOfPrints={state.maxNumberOfPrints}
            setMaxNumberOfPrints={(value) =>
              dispatch({ type: "SET_MAX_NUMBER_OF_PRINTS", payload: value })
            }
            enabledBackgrounds={state.enabledBackgrounds}
            setEnabledBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLED_BACKGROUNDS", payload: value })
            }
            enableCustomBackgrounds={state.enableCustomBackgrounds}
            setEnableCustomBackgrounds={(value) =>
              dispatch({ type: "SET_ENABLE_CUSTOM_BACKGROUNDS", payload: value })
            }
            isFreeDay={state.isFreeDay}
            setIsFreeDay={(value) =>
              dispatch({ type: "SET_IS_FREE_DAY", payload: value })
            }
            showFreeDayOption={state.showFreeDayOption}
            setShowFreeDayOption={(value) =>
              dispatch({ type: "SET_SHOW_FREE_DAY_OPTION", payload: value })
            }
          />
        )}

        {state.currentStep === "receipt" && (
          <FinalReceiptScreen
            userName={state.userName}
            emails={state.emails}
            numberOfPeople={state.numberOfPeople}
            selectedBackgrounds={state.selectedBackgrounds}
            deliveryMethod={state.deliveryMethod}
            numberOfPhotos={state.numberOfPhotos}
            paymentType={state.paymentType}
            basePrice={state.basePrice}
            theme={state.theme}
            isFreeDay={state.isFreeDay}
            customerNumber={state.customerNumber}
            orderNumber={state.orderNumber}
            capturedPhotos={state.capturedPhotos}
            onComplete={resetSession}
          />
        )}
      </div>
      {state.currentStep !== "home" && (
        <AFKWarningDialog
          onTimeout={resetSession}
          initialTimeoutSeconds={30}
          warningTimeoutSeconds={20}
        />
      )}
      {state.currentStep !== "home" && <HelpButton />}
      
      {/* Background outputs dialog */}
      <SelectBackgroundOutputsDialog
        open={showOutputsDialog}
        onOpenChange={setShowOutputsDialog}
        selectedBackgrounds={state.selectedBackgrounds}
        backgroundOutputs={state.backgroundOutputs}
        numberOfPrints={parseInt(state.numberOfPhotos) || 0}
        backgroundNames={backgroundNames}
        backgroundImages={backgroundImages}
        onConfirm={(outputs) => {
          dispatch({ type: "SET_BACKGROUND_OUTPUTS", payload: outputs });
          setShowOutputsDialog(false);
          // Proceed to next step after confirming outputs
          dispatch({
            type: "SET_STEP",
            payload: "userInfo",
          });
        }}
      />
    </div>
  );
}