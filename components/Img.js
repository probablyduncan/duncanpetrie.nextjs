import { getCaption, getSrc } from "@/lib/imageHelper";

export default function Img({img, eager, ...props}) {
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