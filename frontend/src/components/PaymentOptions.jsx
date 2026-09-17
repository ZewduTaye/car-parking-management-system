import { useEffect, useMemo, useState } from "react";
import { CreditCard, Building2, Smartphone, Upload, Clock, CheckCircle } from "lucide-react";
import api from "../Services/api";

function PaymentOptions({ reservation, onPaymentSubmitted }) {
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [receipt, setReceipt] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    const deadline = useMemo(() => {
        if (!reservation?.paymentDeadline) return null;
        return new Date(reservation.paymentDeadline).getTime();
    }, [reservation]);

    useEffect(() => {
        if (!deadline) return;

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

    const submitPayment = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

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

            const response = await api.post("/payments/submit", {
                reservationCode: reservation.reservationCode,
                paymentMethod,
                paymentReference: paymentReference.trim(),
            });

            if (response.data.success) {
                setMessage(
                    "Payment information submitted successfully. Your payment is waiting for verification."
                );

                if (onPaymentSubmitted) {
                    onPaymentSubmitted(response.data.reservation);
                }
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to submit payment information."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="payment-options">
            <div className="payment-header">
                <div>
                    <h2>Complete Your Payment</h2>
                    <p>
                        Reservation:{" "}
                        <strong>
                            {reservation?.reservationCode || "N/A"}
                        </strong>
                    </p>
                </div>

                <div
                    className={`payment-timer ${expired ? "expired" : ""
                        }`}
                >
                    <Clock size={20} />

                    {expired ? (
                        <span>Payment expired</span>
                    ) : (
                        <span>
                            {String(minutes).padStart(2, "0")}:
                            {String(seconds).padStart(2, "0")}
                        </span>
                    )}
                </div>
            </div>

            <div className="payment-deadline">
                <strong>Payment Deadline: 15 Minutes</strong>
                <p>
                    Payment must be completed before your reservation
                    timer expires. If payment is not received within
                    this timeframe, your reservation will be cancelled
                    and the parking space released.
                </p>
            </div>

            <form onSubmit={submitPayment}>
                <h3>Select Payment Method</h3>

                <div className="payment-methods">
                    <button
                        type="button"
                        className={`payment-method ${paymentMethod === "TELEBIRR"
                                ? "selected"
                                : ""
                            }`}
                        onClick={() => setPaymentMethod("TELEBIRR")}
                        disabled={expired}
                    >
                        <Smartphone size={28} />
                        <span>Telebirr</span>
                        <small>Mobile payment</small>
                    </button>

                    <button
                        type="button"
                        className={`payment-method ${paymentMethod === "CBE" ? "selected" : ""
                            }`}
                        onClick={() => setPaymentMethod("CBE")}
                        disabled={expired}
                    >
                        <Building2 size={28} />
                        <span>CBE</span>
                        <small>Bank Transfer</small>
                    </button>

                    <button
                        type="button"
                        className={`payment-method ${paymentMethod === "AWASH"
                                ? "selected"
                                : ""
                            }`}
                        onClick={() => setPaymentMethod("AWASH")}
                        disabled={expired}
                    >
                        <Building2 size={28} />
                        <span>Awash Bank</span>
                        <small>Bank Transfer</small>
                    </button>

                    <button
                        type="button"
                        className={`payment-method ${paymentMethod === "DASHEN"
                                ? "selected"
                                : ""
                            }`}
                        onClick={() => setPaymentMethod("DASHEN")}
                        disabled={expired}
                    >
                        <Building2 size={28} />
                        <span>Dashen Bank</span>
                        <small>Bank Transfer</small>
                    </button>
                </div>

                {paymentMethod && (
                    <div className="payment-details">
                        <h3>
                            {paymentMethod === "TELEBIRR"
                                ? "Telebirr Payment"
                                : "Bank Transfer"}
                        </h3>

                        {paymentMethod === "TELEBIRR" ? (
                            <p>
                                Complete the payment through the official
                                Telebirr payment flow, then enter the
                                transaction reference below.
                            </p>
                        ) : (
                            <p>
                                Complete your bank transfer through{" "}
                                <strong>
                                    {paymentMethod === "CBE"
                                        ? "CBE"
                                        : paymentMethod === "AWASH"
                                            ? "Awash Bank"
                                            : "Dashen Bank"}
                                </strong>{" "}
                                and enter the transaction reference from
                                your payment receipt.
                            </p>
                        )}

                        <label>
                            Transaction Reference Number
                        </label>

                        <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) =>
                                setPaymentReference(e.target.value)
                            }
                            placeholder="Enter transaction reference"
                            disabled={expired || submitting}
                        />

                        {paymentMethod !== "TELEBIRR" && (
                            <>
                                <label className="receipt-label">
                                    Payment Receipt Screenshot
                                </label>

                                <div className="receipt-upload">
                                    <Upload size={20} />

                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) =>
                                            setReceipt(
                                                e.target.files?.[0] || null
                                            )
                                        }
                                        disabled={expired || submitting}
                                    />
                                </div>

                                {receipt && (
                                    <small>
                                        Selected: {receipt.name}
                                    </small>
                                )}
                            </>
                        )}
                    </div>
                )}

                {error && (
                    <div className="payment-message error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="payment-message success">
                        <CheckCircle size={20} />
                        <span>{message}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="submit-payment"
                    disabled={
                        submitting ||
                        expired ||
                        !paymentMethod ||
                        !paymentReference.trim()
                    }
                >
                    <CreditCard size={20} />

                    {submitting
                        ? "Submitting..."
                        : "Submit Payment"}
                </button>
            </form>
        </div>
    );
}

export default PaymentOptions;