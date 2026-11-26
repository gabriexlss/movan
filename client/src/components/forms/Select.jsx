import { Children, isValidElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuCheck, LuChevronDown } from 'react-icons/lu'
import styles from './Select.module.css'

const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')

export default function Select({ children, value = '', onChange, name, id, required, disabled, bare = false, className = '', ...props }) {
    const generatedId = useId()
    const controlId = id || generatedId
    const listId = `${controlId}-opcoes`
    const buttonRef = useRef(null)
    const nativeRef = useRef(null)
    const listRef = useRef(null)
    const searchRef = useRef({ text: '', time: 0 })
    const [dropdown, setDropdown] = useState(null)
    const [invalid, setInvalid] = useState(false)
    const options = Children.toArray(children)
        .filter((child) => isValidElement(child) && child.type === 'option')
        .map((child) => ({
            value: String(child.props.value ?? child.props.children),
            label: String(child.props.children ?? ''),
            disabled: Boolean(child.props.disabled),
        }))
    const selectedIndex = options.findIndex((option) => option.value === String(value))
    const open = Boolean(dropdown) && !disabled
    const activeIndex = dropdown?.activeIndex ?? -1
    const enabledIndexes = options.flatMap((option, index) => option.disabled ? [] : [index])

    const show = (index = selectedIndex) => {
        if (disabled || !options.length) return
        const button = buttonRef.current
        const rect = button.getBoundingClientRect()
        const below = window.innerHeight - rect.bottom - 12
        const above = rect.top - 12
        const upwards = below < Math.min(240, options.length * 44) && above > below
        const width = Math.min(rect.width, window.innerWidth - 16)
        setDropdown({
            activeIndex: options[index]?.disabled || index < 0 ? (enabledIndexes[0] ?? -1) : index,
            container: button.closest('[role="dialog"]') || document.body,
            position: {
                width,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
                maxHeight: Math.max(44, Math.min(288, upwards ? above : below)),
                ...(upwards ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
            },
        })
    }

    const choose = (index) => {
        const option = options[index]
        if (!option || option.disabled) return
        // Mantém os eventos e a validação de formulário do select original.
        nativeRef.current.value = option.value
        nativeRef.current.dispatchEvent(new Event('change', { bubbles: true }))
        setDropdown(null)
        buttonRef.current.focus()
    }

    useEffect(() => {
        if (!open) return undefined
        const closeOutside = (event) => {
            if (!buttonRef.current?.contains(event.target) && !listRef.current?.contains(event.target)) {
                setDropdown(null)
            }
        }
        const closeOnScroll = (event) => {
            if (!listRef.current?.contains(event.target)) setDropdown(null)
        }
        const close = () => setDropdown(null)
        document.addEventListener('pointerdown', closeOutside)
        document.addEventListener('scroll', closeOnScroll, true)
        window.addEventListener('resize', close)
        return () => {
            document.removeEventListener('pointerdown', closeOutside)
            document.removeEventListener('scroll', closeOnScroll, true)
            window.removeEventListener('resize', close)
        }
    }, [open])

    useEffect(() => {
        if (open) listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
    }, [open, activeIndex])

    const handleKeyDown = (event) => {
        const { key } = event
        if (key === 'Escape' && open) {
            event.preventDefault()
            event.stopPropagation()
            setDropdown(null)
        } else if (key === 'Tab') {
            setDropdown(null)
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault()
            if (open) choose(activeIndex)
            else show()
        } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
            event.preventDefault()
            const current = enabledIndexes.indexOf(activeIndex)
            const index = key === 'Home' ? enabledIndexes[0]
                : key === 'End' ? enabledIndexes.at(-1)
                    : enabledIndexes[Math.max(0, Math.min(enabledIndexes.length - 1, current + (key === 'ArrowDown' ? 1 : -1)))]
            if (open) setDropdown((previous) => ({ ...previous, activeIndex: index ?? -1 }))
            else show(key === 'Home' ? enabledIndexes[0]
                : key === 'End' || (key === 'ArrowUp' && (selectedIndex < 0 || options[selectedIndex]?.disabled))
                    ? enabledIndexes.at(-1) : selectedIndex)
        } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            const now = Date.now()
            const previous = searchRef.current
            const text = now - previous.time < 700 ? previous.text + key : key
            searchRef.current = { text, time: now }
            const query = normalizar(text.split('').every((letter) => letter === key) ? key : text)
            const start = open ? activeIndex : selectedIndex
            const indexes = [...enabledIndexes.filter((index) => index > start), ...enabledIndexes.filter((index) => index <= start)]
            const index = indexes.find((item) => normalizar(options[item].label).startsWith(query))
            if (index !== undefined) {
                if (open) setDropdown((previousDropdown) => ({ ...previousDropdown, activeIndex: index }))
                else show(index)
            }
        }
    }

    return (
        <div className={`${styles.root} ${className}`}>
            <select
                ref={nativeRef}
                hidden
                tabIndex={-1}
                aria-hidden="true"
                name={name}
                value={value ?? ''}
                required={required}
                disabled={disabled}
                onChange={(event) => {
                    setInvalid(false)
                    onChange?.(event)
                }}
                onInvalid={(event) => {
                    event.preventDefault()
                    setInvalid(true)
                    buttonRef.current?.focus()
                }}
            >
                {children}
            </select>
            <button
                {...props}
                ref={buttonRef}
                id={controlId}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-controls={open ? listId : undefined}
                aria-expanded={open}
                aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                aria-required={required || undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={[props['aria-describedby'], invalid ? `${controlId}-erro` : ''].filter(Boolean).join(' ') || undefined}
                disabled={disabled}
                className={`${styles.trigger} ${bare ? styles.bare : ''}`}
                onClick={() => open ? setDropdown(null) : show()}
                onKeyDown={handleKeyDown}
            >
                <span>{options[selectedIndex]?.label || (value ? 'Selecione uma opção' : options[0]?.label) || 'Selecione uma opção'}</span>
                <LuChevronDown aria-hidden="true" />
            </button>
            {invalid && <span className={styles.error} id={`${controlId}-erro`} role="alert">Selecione uma opção.</span>}
            {open && createPortal(
                <ul ref={listRef} id={listId} role="listbox" aria-label={props['aria-label']} className={styles.list} style={dropdown.position}>
                    {options.map((option, index) => (
                        <li
                            key={`${option.value}-${index}`}
                            id={`${listId}-${index}`}
                            data-index={index}
                            role="option"
                            aria-selected={index === selectedIndex}
                            aria-disabled={option.disabled || undefined}
                            className={`${styles.option} ${index === activeIndex ? styles.active : ''}`}
                            onPointerMove={() => {
                                if (!option.disabled && activeIndex !== index) setDropdown((previous) => ({ ...previous, activeIndex: index }))
                            }}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => choose(index)}
                        >
                            <span>{option.label}</span>
                            {index === selectedIndex && <LuCheck aria-hidden="true" />}
                        </li>
                    ))}
                </ul>, dropdown.container,
            )}
        </div>
    )
}
