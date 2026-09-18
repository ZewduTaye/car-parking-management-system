import { useEffect, useMemo, useState } from "react";

import {
    CreditCard,
    Building2,
    Smartphone,
    Upload,
    Clock,
    CheckCircle,
    X,
    AlertCircle,
} from "lucide-react";

import { submitPayment } from "../Services/api";

function PaymentOptions({
    reservation,
    onPaymentSubmitted,
    onCancel,
}) {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [receipt, setReceipt] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [remainingSeconds, setRemainingSeconds] = useState(0);

    // -------------------------------------------------------
    // PAYMENT DEADLINE
    // -------------------------------------------------------

    const deadline = useMemo(() => {
        if (!reservation?.paymentDeadline) {
            return null;
        }

        const timestamp = new Date(
            reservation.paymentDeadline
        ).getTime();

        return Number.isNaN(timestamp) ? null : timestamp;
    }, [reservation?.paymentDeadline]);

    // -------------------------------------------------------
    // COUNTDOWN TIMER
    // -------------------------------------------------------

    useEffect(() => {
        if (!deadline) {
            setRemainingSeconds(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.floor((deadline - Date.now()) / 1000)
            );

            setRemainingSeconds(remaining);
        };

        updateTimer();

        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    const expired = remainingSeconds <= 0;

    // -------------------------------------------------------
    // PAYMENT METHOD INFORMATION
    // -------------------------------------------------------

    const bankName =
        paymentMethod === "CBE"
            ? "CBE"
            : paymentMethod === "AWASH"
                ? "Awash Bank"
                : paymentMethod === "DASHEN"
                    ? "Dashen Bank"
                    : "";

    // -------------------------------------------------------
    // SELECT PAYMENT METHOD
    // -------------------------------------------------------

    const selectPaymentMethod = (method) => {
        if (expired || submitting) {
            return;
        }

        setPaymentMethod(method);
        setError("");
        setMessage("");
    };

    // -------------------------------------------------------
    // FILE SELECTION
    // -------------------------------------------------------

    const handleReceiptChange = (event) => {
        const file = event.target.files?.[0] || null;
        setReceipt(file);
    };

    // -------------------------------------------------------
    // SUBMIT PAYMENT
    // -------------------------------------------------------

    const handleSubmitPayment = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!reservation?.reservationCode) {
            setError("Reservation information is missing.");
            return;
        }

        if (!paymentMethod) {
            setError("Please select a payment method.");
            return;
        }

        if (!paymentReference.trim()) {
            setError("Please enter your transaction reference.");
            return;
        }

        if (expired) {
            setError(
                "Your payment deadline has expired. This reservation can no longer be paid."
            );
            return;
        }

        try {
            setSubmitting(true);

            const updatedReservation = await submitPayment({
                reservationCode: reservation.reservationCode,
                paymentMethod,
                paymentReference: paymentReference.trim(),
            });

            setMessage(
                "Payment information submitted successfully. Your payment is waiting for verification."
            );

            if (onPaymentSubmitted) {
                onPaymentSubmitted(updatedReservation);
            }
        } catch (submitError) {
            console.error(
                "Payment submission error:",
                submitError
            );

            setError(
                submitError.message ||
                "Failed to submit payment information."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // -------------------------------------------------------
    // CANCEL / CLOSE
    // -------------------------------------------------------

    const handleCancel = () => {
        if (submitting) {
            return;
        }

        if (onCancel) {
            onCancel();
        }
    };

    // -------------------------------------------------------
    // PAYMENT METHOD CARD
    // -------------------------------------------------------

    const getMethodClass = (method) => {
        const selected = paymentMethod === method;

        return `
      rounded-xl border-2 p-4 text-left
      transition-all duration-200
      ${selected
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
            }
      ${expired || submitting
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }
    `;
    };

    // -------------------------------------------------------
    // UI
    // -------------------------------------------------------

    return (
        <div className="flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* ===================================================
          HEADER
      =================================================== */}

            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-3">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Complete Your Payment
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Reservation:{" "}
                            <strong className="text-slate-700">
                                {reservation?.reservationCode || "N/A"}
                            </strong>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Close"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* ===================================================
          SCROLLABLE CONTENT
      =================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {/* ===================================================
            PAYMENT SUMMARY
        =================================================== */}

                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div>
                        <p className="text-xs text-slate-500">
                            Reservation Status
                        </p>

                        <p className="mt-1 font-semibold text-yellow-600">
                            {reservation?.status || "PENDING"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Payment Status
                        </p>

                        <p className="mt-1 font-semibold text-yellow-600">
                            {reservation?.paymentStatus || "PENDING"}
                        </p>
                    </div>

                    {reservation?.totalAmount !== undefined &&
                        reservation?.totalAmount !== null && (
                            <div className="col-span-2 rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">
                                    Total Amount
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-800">
                                    {Number(
                                        reservation.totalAmount
                                    ).toLocaleString()}{" "}
                                    ETB
                                </p>
                            </div>
                        )}
                </div>

                {/* ===================================================
            TIMER
        =================================================== */}

                <div className="px-6 pt-5">
                    <div
                        className={`flex items-center justify-between rounded-xl border p-4 ${expired
                                ? "border-red-200 bg-red-50"
                                : "border-blue-200 bg-blue-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-lg p-2 ${expired
                                        ? "bg-red-100"
                                        : "bg-blue-100"
                                    }`}
                            >
                                <Clock
                                    className={`h-5 w-5 ${expired
                                            ? "text-red-600"
                                            : "text-blue-600"
                                        }`}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Payment Deadline
                                </p>

                                <p className="text-xs text-slate-500">
                                    Complete payment before the timer expires.
                                </p>
                            </div>
                        </div>

                        <div
                            className={`text-xl font-bold ${expired
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                        >
                            {expired ? (
                                <span>Expired</span>
                            ) : (
                                <span>
                                    {String(minutes).padStart(2, "0")}:
                                    {String(seconds).padStart(2, "0")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===================================================
            DEADLINE MESSAGE
        =================================================== */}

                <div className="px-6 pt-4">
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-sm font-semibold text-yellow-800">
                            Payment must be completed within 15 minutes.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-yellow-700">
                            If payment is not submitted before the
                            deadline, the reservation may expire and the
                            parking space may be released.
                        </p>
                    </div>
                </div>

                {/* ===================================================
            FORM
        =================================================== */}

                <form
                    onSubmit={handleSubmitPayment}
                    className="p-6"
                >
                    {/* =================================================
              PAYMENT METHODS
          ================================================= */}

                    <h3 className="mb-3 text-sm font-bold text-slate-800">
                        Select Payment Method
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* TELEBIRR */}

                        <button
                            type="button"
                            onClick={() =>
                                selectPaymentMethod("TELEBIRR")
                            }
                            disabled={expired || submitting}
                            className={getMethodClass("TELEBIRR")}
                        >
                            <Smartphone
                                className={`h-7 w-7 ${paymentMethod === "TELEBIRR"
                                        ? "text-blue-600"
                                        : "text-slate-500"
                                    }`}
                            />

                            <p className="mt-2 font-bold text-slate-800">
                                Telebirr
                            </p>

                            <p className="text-xs text-slate-500">
                                Mobile payment
                            </p>
                        </button>

                        {/* CBE */}

                        <button
                            type="button"
                            onClick={() => selectPaymentMethod("CBE")}
                            disabled={expired || submitting}
                            className={getMethodClass("CBE")}
                        >
                            <Building2
                                className={`h-7 w-7 ${paymentMethod === "CBE"
                                        ? "text-blue-600"
                                        : "text-slate-500"
                                    }`}
                            />

                            <p className="mt-2 font-bold text-slate-800">
                                CBE
                            </p>

                            <p className="text-xs text-slate-500">
                                Bank transfer
                            </p>
                        </button>

                        {/* AWASH */}

                        <button
                            type="button"
                            onClick={() =>
                                selectPaymentMethod("AWASH")
                            }
                            disabled={expired || submitting}
                            className={getMethodClass("AWASH")}
                        >
                            <Building2
                                className={`h-7 w-7 ${paymentMethod === "AWASH"
                                        ? "text-blue-600"
                                        : "text-slate-500"
                                    }`}
                            />

                            <p className="mt-2 font-bold text-slate-800">
                                Awash Bank
                            </p>

                            <p className="text-xs text-slate-500">
                                Bank transfer
                            </p>
                        </button>

                        {/* DASHEN */}

                        <button
                            type="button"
                            onClick={() =>
                                selectPaymentMethod("DASHEN")
                            }
                            disabled={expired || submitting}
                            className={getMethodClass("DASHEN")}
                        >
                            <Building2
                                className={`h-7 w-7 ${paymentMethod === "DASHEN"
                                        ? "text-blue-600"
                                        : "text-slate-500"
                                    }`}
                            />

                            <p className="mt-2 font-bold text-slate-800">
                                Dashen Bank
                            </p>

                            <p className="text-xs text-slate-500">
                                Bank transfer
                            </p>
                        </button>
                    </div>

                    {/* =================================================
              PAYMENT DETAILS
          ================================================= */}

                    {paymentMethod && (
                        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <div className="mb-4">
                                <h3 className="font-bold text-slate-800">
                                    {paymentMethod === "TELEBIRR"
                                        ? "Telebirr Payment"
                                        : `${bankName} Payment`}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {paymentMethod === "TELEBIRR" ? (
                                        <>
                                            Complete your payment through the
                                            official Telebirr payment flow. Then
                                            enter the transaction reference below.
                                        </>
                                    ) : (
                                        <>
                                            Complete your bank transfer through{" "}
                                            <strong>{bankName}</strong>. Then enter
                                            the transaction reference from your
                                            payment receipt.
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* TRANSACTION REFERENCE */}

                            <div>
                                <label
                                    htmlFor="paymentReference"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Transaction Reference Number
                                </label>

                                <input
                                    id="paymentReference"
                                    type="text"
                                    value={paymentReference}
                                    onChange={(event) =>
                                        setPaymentReference(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter transaction reference"
                                    disabled={expired || submitting}
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                />
                            </div>

                            {/* RECEIPT */}

                            {paymentMethod !== "TELEBIRR" && (
                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Payment Receipt{" "}
                                        <span className="ml-1 font-normal text-slate-400">
                                            (optional for now)
                                        </span>
                                    </label>

                                    <label
                                        className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${expired || submitting
                                                ? "cursor-not-allowed bg-slate-100"
                                                : "cursor-pointer border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                                            }`}
                                    >
                                        <Upload className="h-5 w-5 shrink-0 text-slate-500" />

                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Upload receipt
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                PNG, JPG, or PDF
                                            </p>
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleReceiptChange}
                                            disabled={expired || submitting}
                                            className="hidden"
                                        />
                                    </label>

                                    {receipt && (
                                        <div className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
                                            Selected file:{" "}
                                            <strong>{receipt.name}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================
              ERROR
          ================================================= */}

                    {error && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                            <p className="text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* =================================================
              SUCCESS
          ================================================= */}

                    {message && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

                            <p className="text-sm font-medium">
                                {message}
                            </p>
                        </div>
                    )}

                    {/* =================================================
              BUTTONS
          ================================================= */}

                    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                expired ||
                                !paymentMethod ||
                                !paymentReference.trim()
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    Submit Payment
                                </>
                            )}
                        </button>
                    </div>

                    {/* =================================================
              VERIFICATION NOTE
          ================================================= */}

                    <div className="mt-4 pb-2 text-center">
                        <p className="text-xs leading-5 text-slate-400">
                            After submitting the transaction reference,
                            the payment will remain pending until it is
                            verified by an authorized staff member or
                            administrator.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PaymentOptions;