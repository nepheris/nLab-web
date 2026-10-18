/**
 * Shared Studio Core navigation action. Keeps the iframe engine in its
 * canonical Responsive Test Studio instead of duplicating it per Studio.
 */
export function responsiveTestStudioUrl(source=location.href){
 const destination=new URL('../../responsive-test-studio/',import.meta.url);
 const candidate=new URL(source,location.href);
 if(candidate.protocol==='http:'||candidate.protocol==='https:')destination.searchParams.set('url',candidate.href);
 return destination.href;
}
export function openResponsiveTestStudio(source=location.href){
 const url=responsiveTestStudioUrl(source);
 location.assign(url);
 return url;
}
