export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="container mx-auto px-4 flex flex-col items-center">
                <p className="text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Enterprise Demo. All rights reserved.
                </p>
                <div className="flex gap-4 mt-4 text-sm text-slate-400">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </footer>
    )
}
