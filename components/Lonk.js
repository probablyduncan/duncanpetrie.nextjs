import Link from "next/link"

export default function Lonk({href, children, ...props}) {

    // if href is not specified, then just return a span
    // otherwise, return Link if internal link, <a> if external link 

    return (href ? (<>
        {href.startsWith('http') || href.endsWith('.pdf') || href.endsWith('.html') ? (
            <a 
                href={href} 
                target="_blank" 
                rel="noreferrer"
                alt={href}
                {...props}
            >{children}</a>
        ) : (
            <Link 
            href={href}
                {...props}
            >{children}</Link>
        )}
    </>) : (<>
        <span {...props}>{children}</span>
    </>))
}