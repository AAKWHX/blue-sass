import Image from 'next/image';
export function ServiceImage({service,alt='',priority=false}:{service:string;alt?:string;priority?:boolean}){
 return <div className="bs-service-image"><Image src={`/media/service-${service}-3d.webp`} alt={alt} fill sizes="(max-width:767px) 90vw, 50vw" quality={92} preload={priority}/></div>;
}
