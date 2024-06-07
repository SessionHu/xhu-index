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
        // div.gptitle & hr
        gpe.insertAdjacentHTML("beforeend",`
            <h2 class="gptitle" id="${gp.id}">${gp.name}</h2>
        `);
        // div.gpframe
        const gpframe: HTMLDivElement = document.createElement("div");
        gpframe.className = "gpframe";
        for(const sitebox of gp.links) {
            gpframe.insertAdjacentHTML("beforeend",`
                <!--${sitebox.title}-->
                <a class="siteboxlink" id="${sitebox.id}" title="${sitebox.title}" href="${sitebox.url}">
                    <span class="sitetitle" style="background-image:url('${sitebox.icon}');">${sitebox.titlecn}</span>
                    <span class="sitedescription">${sitebox.desc}</span>
                </a>
            `);
        }
        gpe.insertAdjacentElement("beforeend",gpframe);
        ctt.insertAdjacentElement("beforeend",gpe);
    }
}

fillGroupInfo();
