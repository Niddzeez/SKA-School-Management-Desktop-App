import "../styles/FormInputBoxes.css";

type InputBoxProps = {
  label: string;
  name: string;
  type: "text" | "date" | "select" | "textarea" | "email";
  value: string;
  onChange: (name: string, value: string) => void;
  options?: string[];
  error?: string;
  maxLength?: number;
  numericOnly?: boolean;
  inputMode?: "numeric" | "text";
  required?: boolean;
};

function InputBox({
  label,
  name,
  type,
  value,
  onChange,
  options,
  error,
  maxLength,
  numericOnly,
  required,
}: InputBoxProps) {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    let val = e.target.value;

    if (numericOnly) {
      val = val.replace(/\D/g, "");
    }

    if (maxLength) {
      val = val.slice(0, maxLength);
    }

    onChange(name, val);
  };

  return (
    <div className="box-container">
      <div className="box-content">
        <label className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>

        {type === "select" ? (
          <select
            className={`input-field ${error ? "input-error" : ""}`}
            value={value}
            onChange={handleChange}
          >
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            className={`input-field textarea ${error ? "input-error" : ""}`}
            placeholder={label}
            value={value}
            onChange={handleChange}
          />
        ) : (
          <input
            type={type}
            inputMode={numericOnly ? "numeric" : "text"}
            className={`input-field ${error ? "input-error" : ""}`}
            placeholder={label}
            value={value}
            onChange={handleChange}
          />
        )}

        {error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
}

export default InputBox;
