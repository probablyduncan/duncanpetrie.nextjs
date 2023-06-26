import Link from "next/link"

export default function Lonk({href, children, delay, delayAction, ...props}) {

    // if href is not specified, then just return a span
    // otherwise, return Link if internal link, <a> if external link 

    // delay link redirect
    const delayHref = (e) => {

        if (!delayAction && !delay) return;

        // prevent redirect
        e.preventDefault();

        // if action, do action
        if (delayAction) {
            if (delay) delayAction();
            else delay = delayAction(); // if no delay, get from action
        }

        setTimeout(() => {
            window.location.href = href;
        }, delay)

    }

    return (href ? (<>
        {href.startsWith('http') || href.endsWith('.pdf') || href.endsWith('.html') ? (
            <a 
                href={href}
                target="_blank" 
                rel="noreferrer"
                alt={href}
                title={href}
                {...props}
            >{children}</a>
        ) : (
            <Link 
                href={href}
                onClick={delayHref}
                {...props}
            >
                {children}
            </Link>
        )}
    </>) : (<>
        <span {...props}>{children}</span>
    </>))
}