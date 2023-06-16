import { getCaption, getSrc } from "@/lib/imageHelper";

export default function Img({img, eager, noBorder, ...props}) {

    if (noBorder) {
        if (props.style) {
            props.style.boxShadow = 'inherit';
            props.style.width = '100%';
        } else {
            props.style = {boxShadow: 'inherit', width: '100%'}
        }
        
    }

    return img.src?.endsWith('mp4') ? 
        ( <video controls {...props}>
            <source src={getSrc(img)} type="video/mp4" />
            Your browser does not support video.
        </video> )
    :
        (<img
            alt={getCaption(img) ?? ""} 
            src={getSrc(img)} 
            loading={eager ? "eager" : "lazy"} 
            {...props}
        />)
};