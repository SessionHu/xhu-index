interface SiteGroup {
    id: string,
    name: string,
    links: Sitebox[]
}

interface Sitebox {
    id: string,
    title: string,
    titlecn: string,
    url: string,
    icon: string,
    desc: string,
}

async function fillGroupInfo(): Promise<void> {
    const ctt: HTMLDivElement = document.querySelector("div.content") as HTMLDivElement;
    const gpres: SiteGroup[] = await (await fetch("/assets/sites.json")).json();
    for(const gp of gpres){
        // div.gp
        const gpe: HTMLDivElement = document.createElement("div");
        gpe.className = "gp";
        gpe.id = gp.id;
        // div.gptitle & hr
        gpe.insertAdjacentHTML("beforeend",`
            <h2 class="gptitle">${gp.name}</h2>
        `);
        // div.gpframe
        const gpframe: HTMLDivElement = document.createElement("div");
        gpframe.className = "gpframe";
        for(const sitebox of gp.links) {
            // a.siteboxlink
            const a: HTMLAnchorElement = document.createElement("a");
            a.className = "siteboxlink";
            a.id = sitebox.id;
            a.title = sitebox.title;
            a.href = sitebox.url;
            gpframe.appendChild(a);
            // span.sitetitle
            const sitetitle: HTMLSpanElement = document.createElement("span");
            sitetitle.className = "sitetitle";
            sitetitle.style.backgroundImage = `url('${sitebox.icon}')`;
            sitetitle.innerText = sitebox.titlecn;
            a.appendChild(sitetitle);
            // span.sitedescription
            if(gp.id !== "common") {
                const sitedesc = new HTMLSpanElement();
                sitedesc.className = "sitedescription";
                sitedesc.innerText = sitebox.desc;
                a.appendChild(sitedesc);
            } else a.addEventListener("contextmenu", (ev: MouseEvent) => {
                // only one cross
                if(sitetitle.childElementCount < 1) {
                    ev.preventDefault();
                    // create element
                    const cross: HTMLButtonElement = document.createElement("button");
                    cross.className = "cross";
                    // remove cross and link
                    const remover = (rev?: MouseEvent) => {
                        // remove cross and link
                        rev?.preventDefault();
                        a.remove();
                        if(cross.parentElement !== null) cross.remove();
                        // if no link left
                        if(gpframe.childElementCount < 1) {
                            gpe.remove();
                            fillGroupInfo();
                        }
                    };
                    if(window.innerWidth <= 220) {
                        remover();
                    } else {
                        cross.addEventListener("click", remover);
                        sitetitle.appendChild(cross);
                        // auto remove cross 3s later
                        window.setTimeout(() => cross.remove(), 3e3);
                    }
                }
            });
        }
        gpe.appendChild(gpframe);
        ctt.appendChild(gpe);
    }
}

fillGroupInfo();
